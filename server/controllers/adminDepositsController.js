/**
 * Admin Deposits Controller
 *
 * Handles admin operations for managing deposits:
 * - List all deposits (pending, approved, rejected)
 * - Approve/reject deposits
 * - Add admin notes
 * - When a deposit is approved, credit the user's balance
 */

import { getDb } from "../utils/db.js";

/**
 * List all deposits
 * Returns: Array of deposit objects with user info, amounts, status
 */
export async function listDeposits(req, res) {
    try {
        const db = getDb();
        if (!db) {
            console.error('ListDeposits: Database not connected');
            return res.status(500).json({ message: 'Database not connected' });
        }

        const query = `
            SELECT d.*, u.email as userEmail, u.firstName, u.lastName, u.currency as userCurrency
            FROM deposits d
            LEFT JOIN users u ON d.userId = u.id
            ORDER BY d.requestedAt DESC
        `;

        const [rows] = await db.query(query);
        const deposits = rows.map((row) => ({
            ...row,
            method: row.paymentMethod || row.method,
            currency: row.currency || row.userCurrency || 'USD',
            status: row.status === 'completed' ? 'approved' : row.status === 'failed' ? 'rejected' : row.status,
        }));
        console.log(`ListDeposits: Found ${deposits.length} deposits from database`);
        return res.json(deposits);
    } catch (e) {
        console.error('List deposits error:', e);
        return res.status(500).json({ message: 'Server error', error: e.message });
    }
}

/**
 * Update deposit status (approve/reject)
 *
 * Request body:
 * {
 *   status: 'pending' | 'approved' | 'rejected',
 *   adminNotes: 'reason or additional notes'
 * }
 *
 * When approved: credits user balance
 */
export async function updateDeposit(req, res) {
    try {
        const db = getDb();
        if (!db) {
            console.error('UpdateDeposit: Database not connected');
            return res.status(500).json({ message: 'Database not connected' });
        }

        const { id } = req.params;
        const { status, adminNotes } = req.body;

        console.log(`UpdateDeposit: id=${id}, status=${status}, notes=${adminNotes}`);

        // status: 'pending' → 'approved' or 'rejected'
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Find deposit in database
        const [transactionRows] = await db.query('SELECT * FROM deposits WHERE id = ? LIMIT 1', [id]);
        const transaction = transactionRows[0];
        if (!transaction) {
            console.log(`UpdateDeposit: Deposit not found for id=${id}`);
            return res.status(404).json({ message: 'Deposit not found' });
        }

        console.log(`UpdateDeposit: Found deposit:`, transaction);

        // Start transaction for atomicity
        await db.query('START TRANSACTION');

        try {
            const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const updates = {
                status: status === 'approved' ? 'completed' : status === 'rejected' ? 'failed' : status,
                adminNotes: adminNotes || '',
                approvedAt: status === 'approved' ? now : null,
            };

            const updateKeys = Object.keys(updates);
            const updateValues = Object.values(updates);
            const setClause = updateKeys.map(k => `${k} = ?`).join(", ");

            await db.query(
                `UPDATE deposits SET ${setClause} WHERE id = ?`,
                [...updateValues, id]
            );

            // If deposit is approved, credit user balance
            if (status === 'approved') {
                await db.query(
                    'UPDATE users SET balanceUsd = balanceUsd + ? WHERE id = ?',
                    [transaction.amount, transaction.userId]
                );
                console.log(`UpdateDeposit: Credited ${transaction.amount} to user ${transaction.userId}`);
            }

            await db.query('COMMIT');
            console.log(`UpdateDeposit: Success for id=${id}`);
            return res.json({ success: true });
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    } catch (e) {
        console.error('Update deposit error:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}