const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 6,
            select: false,
        },
        firstName: {
            type: String,
            trim: true,
            maxlength: 50,
        },
        lastName: {
            type: String,
            trim: true,
            maxlength: 50,
        },
        country: {
            type: String,
            trim: true,
        },

        // Financial - Admin managed
        balanceUsd: {
            type: Number,
            default: 0,
            min: 0,
        },
        roi: {
            type: Number,
            default: 0,
        },

        // Status Flags
        banned: {
            type: Boolean,
            default: false,
        },
        frozen: {
            type: Boolean,
            default: false,
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        kycVerified: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'superadmin'],
            default: 'user',
        },
        lastLogin: Date,

        // Bank Details - Sensitive
        bankAccountHolder: String,
        bankName: String,
        bankAccountNumber: {
            type: String,
            select: false,
        },
        bankRoutingNumber: {
            type: String,
            select: false,
        },

        // Crypto Wallets
        bitcoinAddress: String,
        ethereumAddress: String,
        otherCryptoAddresses: [String],

        // Profile
        avatar: String,
        phone: String,
        dateOfBirth: Date,

        // Security
        twoFactorEnabled: {
            type: Boolean,
            default: false,
        },
        twoFactorSecret: {
            type: String,
            select: false,
        },
        loginAttempts: {
            type: Number,
            default: 0,
        },
        lockUntil: Number,
        refreshTokens: [{
            type: String,
            select: false,
        }],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
UserSchema.index({ createdAt: -1 });
UserSchema.index({ banned: 1 });
UserSchema.index({ emailVerified: 1 });
UserSchema.index({ kycVerified: 1 });

// Virtuals
UserSchema.virtual('fullName').get(function () {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.email;
});

// Hash password
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
UserSchema.methods.isLocked = function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
UserSchema.methods.incrementLoginAttempts = async function () {
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        });
    }

    const updates = { $inc: { loginAttempts: 1 } };
    if (this.loginAttempts + 1 >= 5 && !this.lockUntil) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
    }
    return this.updateOne(updates);
};

module.exports = mongoose.model('User', UserSchema);