/**
 * Admin Withdrawals Controller
 *
 * Handles admin operations for managing withdrawals:
 * - List all withdrawals (pending, approved, rejected)
 * - Approve/reject withdrawals
 * - Add admin notes
 * - When a withdrawal is approved, debit the user's balance
 */

import { getDb } from "../utils/db.js";

/**
 * List all withdrawals
 * Returns: Array of withdrawal objects with user info, amounts, status
 */
export async function listWithdrawals(req, res) {
    try {
        const db = getDb();
        if (!db) {
            console.error('ListWithdrawals: Database not connected');
            return res.status(500).json({ message: 'Database not connected' });
        }

        const query = `
            SELECT w.*, u.email as userEmail, u.firstName, u.lastName, u.currency as userCurrency
            FROM withdrawals w
            LEFT JOIN users u ON w.userId = u.id
            ORDER BY w.requestedAt DESC
        `;

        const [rows] = await db.query(query);
        const withdrawals = rows.map((row) => ({
            ...row,
            method: row.withdrawalMethod || row.method,
            currency: row.currency || row.userCurrency || 'USD',
            status: row.status === 'completed' ? 'approved' : row.status === 'failed' ? 'rejected' : row.status,
        }));
        console.log(`ListWithdrawals: Found ${withdrawals.length} withdrawals from database`);
        return res.json(withdrawals);
    } catch (e) {
        console.error('List withdrawals error:', e);
        return res.status(500).json({ message: 'Server error', error: e.message });
    }
}

/**
 * Update withdrawal status (approve/reject)
 *
 * Request body:
 * {
 *   status: 'pending' | 'approved' | 'rejected',
 *   adminNotes: 'reason or additional notes'
 * }
 *
 * When approved: debits user balance (if sufficient funds)
 */
export async function updateWithdrawal(req, res) {
    try {
        const db = getDb();
        if (!db) {
            console.error('UpdateWithdrawal: Database not connected');
            return res.status(500).json({ message: 'Database not connected' });
        }

        const { id } = req.params;
        const { status, adminNotes } = req.body;

        console.log(`UpdateWithdrawal: id=${id}, status=${status}, notes=${adminNotes}`);

        // status: 'pending' → 'approved' or 'rejected'
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Find withdrawal in database
        const [transactionRows] = await db.query('SELECT * FROM withdrawals WHERE id = ? LIMIT 1', [id]);
        const transaction = transactionRows[0];
        if (!transaction) {
            console.log(`UpdateWithdrawal: Withdrawal not found for id=${id}`);
            return res.status(404).json({ message: 'Withdrawal not found' });
        }

        console.log(`UpdateWithdrawal: Found withdrawal:`, transaction);

        // Start transaction for atomicity
        await db.query('START TRANSACTION');

        try {
            const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const updates = {
                status: status === 'approved' ? 'completed' : status === 'rejected' ? 'failed' : status,
                adminNotes: adminNotes || '',
                approvedAt: status === 'approved' ? now : null,
                processedAt: status === 'approved' ? now : null,
            };

            const updateKeys = Object.keys(updates);
            const updateValues = Object.values(updates);
            const setClause = updateKeys.map(k => `${k} = ?`).join(", ");

            await db.query(
                `UPDATE withdrawals SET ${setClause} WHERE id = ?`,
                [...updateValues, id]
            );

            // If withdrawal is approved, debit user balance (check sufficient funds)
            if (status === 'approved') {
                // Check current balance
                const [userRows] = await db.query('SELECT balanceUsd FROM users WHERE id = ? LIMIT 1', [transaction.userId]);
                const user = userRows[0];

                const amountToDebit = Math.abs(transaction.amount);
                if (!user || user.balanceUsd < amountToDebit) {
                    await db.query('ROLLBACK');
                    return res.status(400).json({ message: 'Insufficient funds for withdrawal' });
                }

                await db.query(
                    'UPDATE users SET balanceUsd = balanceUsd - ? WHERE id = ?',
                    [amountToDebit, transaction.userId]
                );
                console.log(`UpdateWithdrawal: Debited ${amountToDebit} from user ${transaction.userId}`);
            }

            await db.query('COMMIT');
            console.log(`UpdateWithdrawal: Success for id=${id}`);
            return res.json({ success: true });
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    } catch (e) {
        console.error('Update withdrawal error:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}