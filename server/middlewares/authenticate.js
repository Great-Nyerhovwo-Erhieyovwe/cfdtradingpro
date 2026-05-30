/**
 * Authentication Middleware
 * =========================
 * 
 * This middleware validates JWT tokens and attaches authenticated user data to requests.
 * 
 * How it works:
 * 1. Extracts JWT token from "Authorization: Bearer <token>" header
 * 2. Verifies token signature using JWT_SECRET from environment
 * 3. Decodes token to get user ID (stored in 'sub' claim)
 * 4. Queries database to fetch full user object
 * 5. Attaches user object to req.user for use in route handlers
 * 
 * If any step fails, returns 401 Unauthorized
 */

import jwt from "jsonwebtoken";
import { provider } from "../services/dataProvider.js";

/**
 * Authenticate Middleware Function
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.headers - Request headers
 * @param {string} req.headers.authorization - Should be "Bearer <JWT_TOKEN>"
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * On success: Sets req.user = user object and calls next()
 * On failure: Returns 401 status
 * 
 * Usage in routes:
 *   router.get('/protected', authenticate, (req, res) => {
 *     console.log(req.user); // User object is now available
 *   });
 */
export async function authenticate(req, res, next) {
    try {
        // ============================================
        // STEP 1: Extract Authorization Header or Cookie
        // ============================================
        // Try Authorization header first, then fall back to cookie
        let token = null;
        const auth = req.headers.authorization;
        
        if (auth?.startsWith("Bearer ")) {
            token = auth.split(" ")[1];
        } else if (req.cookies?.jwt) {
            // Fall back to httpOnly cookie
            token = req.cookies.jwt;
        }
        
        if (!token) {
            console.warn('Missing token in Authorization header or cookie');
            return res.sendStatus(401); // 401 Unauthorized
        }

        // ============================================
        // STEP 2: Verify JWT Token Signature
        // ============================================
        // Verify token using JWT_SECRET from environment
        // If signature is invalid or token is expired, this throws an error
        const secret = process.env.JWT_SECRET || process.env.VITE_JWT_SECRET;
        if (!secret) {
            console.error('JWT_SECRET not configured in environment');
            return res.sendStatus(500);
        }

        const payload = jwt.verify(token, secret);

        // ============================================
        // STEP 3: Fetch User from Database
        // ============================================

        // Ensure subject is numeric id
        const userId = Number(payload.sub);
        if (!Number.isFinite(userId) || Number.isNaN(userId)) {
            console.warn('Invalid token subject (sub) - not a numeric id');
            return res.sendStatus(401);
        }

        // Use provider abstraction which handles MariaDB and local db.json fallback
        const user = await provider.findOne('users', { id: userId });

        if (!user) {
            console.warn(`User with ID ${userId} not found`);
            return res.sendStatus(401);
        }

        // ============================================
        // STEP 4: Attach User to Request
        // ============================================
        // Set req.user so route handlers can access authenticated user's data
        // This is the FULL user object from database (all fields)
        req.user = user;

        // Continue to next middleware/route handler
        next();

    } catch (e) {
        // ============================================
        // ERROR HANDLING
        // ============================================
        // JWT verification can fail for multiple reasons:
        // - Invalid signature (token was tampered with)
        // - Expired token (past exp time)
        // - Malformed token (not valid JWT format)
        // - Database error while fetching user
        
        console.error("Authentication error:", e.message || e);
        return res.sendStatus(401); // 401 Unauthorized
    }
}
