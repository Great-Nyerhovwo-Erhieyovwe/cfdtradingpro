import mysql from 'mysql2/promise';

// MariaDB/MySQL helper: connect and expose `db` instance..
let pool = null;
let db = null;

export async function connectDB() {
    // if (!uri) return null;
    try {
        console.log('🔄 Attempting to connect to MariaDB...');
        // First connect without database to create it if needed
        const tempPool = mysql.createPool({
            host: process.env.DB_HOST || process.env.VITE_DB_HOST,
            user: process.env.DB_USER || process.env.VITE_DB_USER,
            database: process.env.DB_NAME || process.env.VITE_DB_NAME || 'cfdtradingprodb',
            password: process.env.DB_PASS || process.env.VITE_DB_PASS || 'SilverWC@101',
            port: process.env.DB_PORT || process.env.VITE_DB_PORT || 3307,
            waitForConnections: true,
            connectionLimit: 10,
            connectTimeout: 5000, // 5 second timeout...
        });

        const dbName = process.env.DB_NAME || process.env.VITE_DB_NAME || 'cfdtradingprodb';
        
        // Create database if it doesn't exist
        console.log('🔍 Checking if database exists...');
        await tempPool.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await tempPool.end();

        // Now connect to the specific database
        pool = mysql.createPool({
            host: process.env.DB_HOST || process.env.VITE_DB_HOST,
            user: process.env.DB_USER || process.env.VITE_DB_USER,
            password: process.env.DB_PASS || process.env.VITE_DB_PASS || 'SilverWC@101',
            database: process.env.DB_NAME || process.env.VITE_DB_NAME || 'cfdtradingprodb',
            port: process.env.DB_PORT || process.env.VITE_DB_PORT || 3307,
            waitForConnections: true,
            connectionLimit: 10,
            connectTimeout: 5000, // 5 second timeout
        });

        // test connection with timeout
        console.log('🔌 Testing database connection...');
        const conn = await Promise.race([
            pool.getConnection(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
        ]);
        conn.release();

        db = pool;

        console.log("✅ Connected to MariaDB");
        return db;

    } catch (err) {
        console.error("⚠️  MariaDB connection error:", err.message || err);
        pool = null;
        db = null;
        console.log('💾 Will use fallback db.json instead');
        return null;
    }
}

export function getDb() {
    return db;
}

// Query helper (VERY IMPORTANT)
export async function query(sql, params = []) {
    if (!pool) {
        console.error('❌ Database pool not connected');
        throw new Error('Database not connected');
    }

    try {
        console.log('🔍 Executing query:', sql, 'with params:', params);
        const [rows] = await pool.execute(sql, params);
        console.log('✅ Query successful, returned', rows.length, 'rows');
        return rows;
    } catch (err) {
        console.error('❌ Query execution error:', err.message || err);
        console.error('❌ Query was:', sql);
        console.error('❌ Params were:', params);
        throw err;
    }
}

export async function closeDB() {
    if (pool) {
        await pool.end();
        console.log("MariaDB connection closed");
    }
    pool = null;
    db = null;
}


export default db;