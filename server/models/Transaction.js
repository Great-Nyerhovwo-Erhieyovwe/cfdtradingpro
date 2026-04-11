const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['deposit', 'withdrawal'],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            default: 'USD',
            uppercase: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'cancelled'],
            default: 'pending',
            index: true,
        },
        method: {
            type: String,
            enum: ['bank_transfer', 'crypto', 'card', 'paypal', 'other'],
            required: true,
        },

        // Payment Details
        txHash: String, // For crypto transactions
        bankReference: String,
        cardLast4: String,

        // Admin Review Fields
        adminNotes: String,
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        reviewedAt: Date,
        completedAt: Date,

        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for admin queries
TransactionSchema.index({ status: 1, createdAt: -1 });
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ type: 1, status: 1 });

// Static: Get financial summary for admin dashboard
TransactionSchema.statics.getSummary = async function () {
    const result = await this.aggregate([
        { $match: { status: 'approved' } },
        {
            $group: {
                _id: '$type',
                total: { $sum: '$amount' },
                count: { $sum: 1 },
            },
        },
    ]);

    const deposits = result.find(r => r._id === 'deposit') || { total: 0, count: 0 };
    const withdrawals = result.find(r => r._id === 'withdrawal') || { total: 0, count: 0 };

    return {
        totalDeposits: deposits.total,
        totalWithdrawals: withdrawals.total,
        depositCount: deposits.count,
        withdrawalCount: withdrawals.count,
    };
};

// Static: Get pending transactions for admin
TransactionSchema.statics.getPending = function () {
    return this.find({ status: 'pending' })
        .populate('userId', 'email firstName lastName')
        .sort({ createdAt: -1 });
};

// Method: Approve transaction (admin only)
TransactionSchema.methods.approve = async function (adminId, notes) {
    this.status = 'approved';
    this.reviewedBy = adminId;
    this.reviewedAt = new Date();
    this.completedAt = new Date();
    if (notes) this.adminNotes = notes;
    return this.save();
};

// Method: Reject transaction (admin only)
TransactionSchema.methods.reject = async function (adminId, notes) {
    this.status = 'rejected';
    this.reviewedBy = adminId;
    this.reviewedAt = new Date();
    if (notes) this.adminNotes = notes;
    return this.save();
};

module.exports = mongoose.model('Transaction', TransactionSchema);