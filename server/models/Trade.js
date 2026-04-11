const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        symbol: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ['buy', 'sell'],
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'closed', 'cancelled'],
            default: 'active',
            index: true,
        },

        // Pricing
        entryPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        exitPrice: {
            type: Number,
            min: 0,
        },
        quantity: {
            type: Number,
            required: true,
            min: 0,
        },
        leverage: {
            type: Number,
            default: 1,
            min: 1,
            max: 100,
        },

        // P&L Calculated fields
        profitLoss: Number,
        profitLossPercent: Number,
        result: {
            type: String,
            enum: ['win', 'loss', 'cancelled', 'breakeven'],
        },

        // Timestamps
        openedAt: {
            type: Date,
            default: Date.now,
        },
        closedAt: Date,

        // Admin fields
        adminNotes: String,
        closedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },

        // Risk management
        stopLoss: Number,
        takeProfit: Number,

        // Asset info
        assetType: {
            type: String,
            enum: ['crypto', 'stock', 'forex', 'commodity'],
            default: 'crypto',
        },
        exchange: String,
    },
    {
        timestamps: true,
    }
);

TradeSchema.index({ status: 1, openedAt: -1 });
TradeSchema.index({ userId: 1, status: 1 });

// Pre-save: Calculate P&L
TradeSchema.pre('save', function (next) {
    if (this.isModified('exitPrice') && this.exitPrice && this.status === 'closed') {
        const totalEntry = this.entryPrice * this.quantity;
        const totalExit = this.exitPrice * this.quantity;

        this.profitLoss = this.type === 'buy'
            ? totalExit - totalEntry
            : totalEntry - totalExit;

        this.profitLossPercent = (this.profitLoss / totalEntry) * 100;

        if (this.profitLoss > 0) this.result = 'win';
        else if (this.profitLoss < 0) this.result = 'loss';
        else this.result = 'breakeven';
    }
    next();
});

// Method: Close trade manually (admin)
TradeSchema.methods.closeManually = async function (exitPrice, result, adminId, notes) {
    this.exitPrice = exitPrice;
    this.status = 'closed';
    this.result = result;
    this.closedAt = new Date();
    this.closedBy = adminId;
    if (notes) this.adminNotes = notes;
    return this.save();
};

module.exports = mongoose.model('Trade', TradeSchema);