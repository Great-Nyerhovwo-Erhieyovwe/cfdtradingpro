const mongoose = require('mongoose');

const AdminLogSchema = new mongoose.Schema(
    {
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        action: {
            type: String,
            required: true,
        },
        resourceType: {
            type: String,
            enum: ['user', 'transaction', 'trade', 'verification', 'ticket', 'plan', 'settings'],
            required: true,
        },
        resourceId: mongoose.Schema.Types.ObjectId,
        details: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        ipAddress: String,
        userAgent: String,
    },
    {
        timestamps: true,
        expireAfterSeconds: 2592000, // 30 days TTL
    }
);

module.exports = mongoose.model('AdminLog', AdminLogSchema);