/**
 * CFD Trading Pro - Backend Server
 * ====================================
 * 
 * Main Express server setup with:
 * - MariaDB connection (primary)
 * - Local db.json fallback (secondary)
 * - CORS and security middleware
 * - API route management
 * 
 * Architecture Overview:
 * ┌─────────────────────────────────────────────────┐
 * │  Frontend (React + Vite) - http://localhost:5173│
 * └─────────────────┬───────────────────────────────┘
 *                   │ HTTP Requests (JWT auth)
 *                   ▼
 * ┌─────────────────────────────────────────────────┐
 * │  Express Server - http://localhost:4000         │
 * │  ├─ CORS middleware (cross-origin)              │
 * │  ├─ JSON body parser                            │
 * │  └─ API routes (/api/auth, /api/dashboard)      │
 * └─────────────────┬───────────────────────────────┘
 *                   │
 *                   ├──► MariaDB (Primary DB)
 *                   └──► db.json (Fallback DB)
 */

// ============================================
// IMPORTS
// ============================================
import 'dotenv/config';                    // Load environment variables from .env
import express from 'express';              // Web framework
import cors from 'cors';                    // Cross-Origin Resource Sharing
import helmet from 'helmet';                // Security headers
import routes from './routes/index.js';     // API routes
import { connectDB } from './utils/db.js'; // MariaDB utilities
import { provider } from './services/dataProvider.js'; // Data provider (MariaDB/JSON)
import jwt from 'jsonwebtoken';             // JWT token handling (optional, for reference)
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


// ============================================
// MariaDB Connection Setup
// ============================================
// import { connectMariaDB } from './utils/mariadb.js'; // MariaDB utilities

// ============================================
// INITIALIZE EXPRESS APP
// ============================================
const app = express();
// const PORT = process.env.PORT || 4000;

// ============================================
// CORS CONFIGURATION
// ============================================
// Determines which frontend URLs can make requests to this backend
// Essential for cross-origin requests from React frontend
const FRONTEND_ORIGIN = 
    process.env.FRONTEND_ORIGIN || 
    process.env.VITE_FRONTEND_ORIGIN || 
    'https://localhost:5173';

// Configure CORS to allow requests from frontend
// credentials: true allows cookies to be sent with requests
app.use(cors({ 
    origin: FRONTEND_ORIGIN, 
    credentials: true 
}));

// ============================================
// SECURITY & MIDDLEWARE
// ============================================
// Helmet sets security headers (prevents XSS, clickjacking, etc.)
app.use(helmet());

// Parse JSON request bodies (e.g., POST /login with { email, password })
app.use(express.json());

// Parse URL-encoded request bodies (e.g., form submissions)
app.use(express.urlencoded({ extended: true }));

// ============================================
// API ROUTES
// ============================================
// Mount all API routes under /api prefix
// Routes structure:
//   /api/auth/*           - Authentication (login, signup, OTP)
//   /api/admin/*          - Admin operations
//   /api/dashboard/*      - User dashboard (requires JWT auth)
app.use('/api', routes);

// app.use('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'index.html'));
// })

// ===========================================
// Build setup for ES Modules
// ===========================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================
// SERVE FRONTEND (React build in /dist)
// ============================================

// 1. Serve static files (JS, CSS, images)
app.use(express.static(path.join(__dirname, 'dist')));

// 2. SPA fallback (VERY IMPORTANT FIX)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ============================================
// GLOBAL ERROR HANDLER (MUST BE LAST)
// ============================================
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error' });
});



// ============================================
// DATABASE CONNECTION & SERVER STARTUP
// ============================================
/**
 * Initialize MariaDB schema (create tables if they don't exist)
 */
async function initializeSchema(db) {
    if (!db) return;
    
    try {
        // Create tables if they don't exist
        const tables = [
            `CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255),
                firstName VARCHAR(100),
                lastName VARCHAR(100),
                country VARCHAR(100),
                balanceUsd DECIMAL(15,2) DEFAULT 0,
                roi DECIMAL(10,2) DEFAULT 0,
                banned BOOLEAN DEFAULT false,
                frozen BOOLEAN DEFAULT false,
                emailVerified BOOLEAN DEFAULT false,
                kycVerified BOOLEAN DEFAULT false,
                role ENUM('user', 'admin', 'superadmin') DEFAULT 'user',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                lastLogin DATETIME,
                bankAccountHolder VARCHAR(255),
                bankName VARCHAR(255),
                bankAccountNumber VARCHAR(255),
                bankRoutingNumber VARCHAR(255),
                bitcoinAddress VARCHAR(255),
                ethereumAddress VARCHAR(255),
                withdrawal_min_usd DECIMAL(10,2),
                withdrawal_max_usd DECIMAL(10,2),
                verificationApprovedAt DATETIME,
                upgradeLevel VARCHAR(50) DEFAULT 'free'
            )`,
            `ALTER TABLE users MODIFY COLUMN id VARCHAR(36) PRIMARY KEY`,
            `CREATE TABLE IF NOT EXISTS transactions (
                id VARCHAR(36) PRIMARY KEY,
                userId VARCHAR(36) NOT NULL,
                amount DECIMAL(15,2),
                currency VARCHAR(10),
                type ENUM('deposit', 'withdrawal'),
                status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
                method VARCHAR(50),
                txHash VARCHAR(255),
                bankReference VARCHAR(255),
                destinationAddress VARCHAR(255),
                adminNotes TEXT,
                reviewedBy VARCHAR(36),
                reviewedAt DATETIME,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                completedAt DATETIME,
                FOREIGN KEY (userId) REFERENCES users(id)
            )`,
            `CREATE TABLE IF NOT EXISTS trades (
                id VARCHAR(36) PRIMARY KEY,
                userId VARCHAR(36) NOT NULL,
                symbol VARCHAR(50),
                type ENUM('buy', 'sell'),
                status ENUM('active', 'closed', 'cancelled') DEFAULT 'active',
                entryPrice DECIMAL(15,4),
                exitPrice DECIMAL(15,4),
                quantity DECIMAL(15,4),
                leverage DECIMAL(5,2),
                profitLoss DECIMAL(15,2),
                profitLossPercent DECIMAL(10,2),
                result ENUM('win', 'loss', 'cancelled', 'breakeven'),
                openedAt DATETIME,
                closedAt DATETIME,
                adminNotes TEXT,
                closedBy VARCHAR(36),
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id)
            )`,
            `CREATE TABLE IF NOT EXISTS verifications (
                id VARCHAR(36) PRIMARY KEY,
                userId VARCHAR(36) NOT NULL,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                documentType VARCHAR(50),
                documentNumber VARCHAR(255),
                idType VARCHAR(50),
                idNumber VARCHAR(255),
                expiryDate DATE,
                expiresAt DATETIME,
                fullName VARCHAR(255),
                submittedData JSON,
                documents JSON,
                adminNotes TEXT,
                requestedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                reviewedAt DATETIME,
                verificationLevel INT DEFAULT 1,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id)
            )`,
            `CREATE TABLE IF NOT EXISTS upgrade_plans (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                slug VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                priceMonthly DECIMAL(10,2),
                priceAnnual DECIMAL(10,2),
                currency VARCHAR(10) DEFAULT 'USD',
                features JSON,
                limits JSON,
                active BOOLEAN DEFAULT true,
                popular BOOLEAN DEFAULT false,
                displayOrder INT DEFAULT 0,
                color VARCHAR(20),
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS admin_logs (
                id VARCHAR(36) PRIMARY KEY,
                adminId VARCHAR(36) NOT NULL,
                action VARCHAR(100),
                targetId VARCHAR(36),
                changes JSON,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_admin_logs_adminId FOREIGN KEY (adminId) REFERENCES users(id)
            )`,
            `CREATE TABLE IF NOT EXISTS messages (
                id VARCHAR(36) PRIMARY KEY,
                senderId VARCHAR(36) NOT NULL,
                recipientId VARCHAR(36),
                content TEXT,
                type ENUM('direct','warning','notice') DEFAULT 'direct',
                subject VARCHAR(255),
                status ENUM('pending','completed') DEFAULT 'pending',
                isRead BOOLEAN DEFAULT false,
                completedAt DATETIME,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_messages_senderId FOREIGN KEY (senderId) REFERENCES users(id)
            )`,
            `ALTER TABLE messages MODIFY COLUMN id VARCHAR(36) PRIMARY KEY`,
            `CREATE TABLE IF NOT EXISTS support_tickets (
                id VARCHAR(36) PRIMARY KEY,
                userId VARCHAR(36) NOT NULL,
                subject VARCHAR(255),
                status ENUM('open','in-progress','resolved','closed') DEFAULT 'open',
                replies JSON,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME,
                CONSTRAINT fk_support_tickets_userId FOREIGN KEY (userId) REFERENCES users(id)
            )`,
            `CREATE TABLE IF NOT EXISTS upgrades (
                id VARCHAR(36) PRIMARY KEY,
                userId VARCHAR(36) NOT NULL,
                currentLevel VARCHAR(100),
                targetLevel VARCHAR(100),
                status ENUM('pending','approved','rejected') DEFAULT 'pending',
                price DECIMAL(10,2),
                adminNotes TEXT,
                requestedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                reviewedAt DATETIME,
                reviewedBy VARCHAR(255),
                CONSTRAINT fk_upgrades_userId FOREIGN KEY (userId) REFERENCES users(id)
            )`
        ];

        for (const createTable of tables) {
            try {
                await db.query(createTable);
            } catch (e) {
                if (!e.message.includes('already exists')) {
                    console.warn('Schema creation warning:', e.message);
                }
            }
        }

        // Apply schema migrations for existing tables.
        const migrations = [
            `ALTER TABLE verifications ADD COLUMN reviewedAt DATETIME`,
            `ALTER TABLE verifications ADD COLUMN reviewedBy VARCHAR(255)`,
            `ALTER TABLE users ADD COLUMN verificationApprovedAt DATETIME`,
            `ALTER TABLE messages ADD COLUMN status ENUM('pending','completed') DEFAULT 'pending'`,
            `ALTER TABLE messages ADD COLUMN completedAt DATETIME`
        ];

        for (const migration of migrations) {
            try {
                await db.query(migration);
            } catch (e) {
                if (!e.message.includes('already exists') && !e.message.includes('Duplicate column name')) {
                    console.warn('Schema migration warning:', e.message);
                }
            }
        }

        console.log('✅ Database schema initialized');
    } catch (e) {
        console.error('Schema initialization error:', e.message);
    }
}

/**
 * Startup sequence:
 * 1. Read MariaDB connection credentials from environment variables
 * 2. Attempt to connect to MariaDB 
 * 3. If successful, initialize schema and use MariaDB as primary database
 * 4. If failed, fall back to local db.json file
 * 5. Start Express server on specified PORT
 */
async function start() {
    const PORT = process.env.PORT || 4000;

    // Connect to MariaDB
    const db = await connectDB();
    console.log('DB connection result:', !!db);

    // Initialize schema if MariaDB is connected
    if (db) {
        await initializeSchema(db);
        console.log('✅ Database ready for use');
    } else {
        // No MariaDB connection — prepare fallback
        console.error('⚠️  MariaDB connection failed');
        console.log('📁 Using fallback data store: db.json file');
        
        // Ensure db.json exists with proper schema
        const dbFile = path.resolve('./db.json');
        if (!fs.existsSync(dbFile)) {
            fs.writeFileSync(dbFile, JSON.stringify({
                users: [],
                transactions: [],
                trades: [],
                verifications: [],
                upgrade_plans: [],
                admin_logs: [],
                messages: []
            }, null, 2));
            console.log('✅ Created fallback db.json');
        }
    }


    // ============================================
    // Start Express Server
    // ============================================
    app.listen(PORT, () => {
        console.log(`🚀 API listening on http://localhost:${PORT}`);
        console.log(`📱 Frontend URL: ${FRONTEND_ORIGIN}`);
        console.log('\n✨ Server ready for requests!\n');
    });
}

// ============================================
// ERROR HANDLING FOR STARTUP
// ============================================
start().catch((e) => {
    console.error('❌ Failed to start server:', e);
    process.exit(1); // Exit with error code
});
