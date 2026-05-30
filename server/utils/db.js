import mysql from 'mysql2/promise';

let pool = null;
let db = null;

const parseBoolean = (value) => ['1', 'true', 'TRUE', 'yes', 'YES'].includes(String(value).trim());

export async function connectDB() {
    const host = process.env.DB_HOST || process.env.VITE_DB_HOST || 'localhost';
    const user = process.env.DB_USER || process.env.VITE_DB_USER || 'root';
    const password = process.env.DB_PASS || process.env.VITE_DB_PASS || '';
    const database = process.env.DB_NAME || process.env.VITE_DB_NAME || '';
    const port = Number(process.env.DB_PORT || process.env.VITE_DB_PORT || 3306);
    const connectTimeout = Number(process.env.DB_CONNECT_TIMEOUT || process.env.VITE_DB_CONNECT_TIMEOUT || 10000);
    const useSsl = parseBoolean(process.env.DB_SSL || process.env.VITE_DB_SSL || '');

    const commonConfig = {
        host,
        user,
        password,
        port,
        waitForConnections: true,
        connectionLimit: 10,
        connectTimeout,
        ...(useSsl ? { ssl: { rejectUnauthorized: parseBoolean(process.env.DB_SSL_REJECT_UNAUTHORIZED || process.env.VITE_DB_SSL_REJECT_UNAUTHORIZED || 'false') } } : {}),
    };

    const createPoolAndTest = async (config) => {
        const candidate = mysql.createPool(config);
        try {
            const conn = await Promise.race([
                candidate.getConnection(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), connectTimeout)),
            ]);
            conn.release();
            return candidate;
        } catch (error) {
            await candidate.end().catch(() => {});
            throw error;
        }
    };

    if (!database) {
        console.error('❌ Database name is not configured; cannot establish MariaDB connection.');
        pool = null;
        db = null;
        return null;
    }

    try {
        console.log('🔄 Attempting MariaDB connection with configured database...');
        pool = await createPoolAndTest({ ...commonConfig, database });
        db = pool;
        console.log('✅ Connected to MariaDB database:', database);
        return db;
    } catch (error) {
        console.warn('⚠️  Direct MariaDB connection failed:', error.message || error);
    }

    try {
        console.log('🔄 Attempting MariaDB connection without database for cPanel compatibility...');
        pool = await createPoolAndTest(commonConfig);
        await pool.query('USE `' + database + '`');
        db = pool;
        console.log('✅ Connected to MariaDB and selected database:', database);
        return db;
    } catch (error) {
        console.error('⚠️  MariaDB fallback connection failed:', error.message || error);
        await pool?.end().catch(() => {});
        pool = null;
        db = null;
        return null;
    }
}

export function getDb() {
    return db;
}

export async function query(sql, params = []) {
    if (!pool) {
        console.error('❌ Database pool not connected');
        throw new Error('Database not connected');
    }

    try {
        console.log('🔍 Executing query:', sql, 'with params:', params);
        const [rows] = await pool.execute(sql, params);
        console.log('✅ Query successful, returned', Array.isArray(rows) ? rows.length : 'unknown', 'rows');
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
        console.log('MariaDB connection closed');
    }
    pool = null;
    db = null;
}
