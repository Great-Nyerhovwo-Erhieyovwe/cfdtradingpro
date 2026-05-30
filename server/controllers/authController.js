import nodemailer from "nodemailer";
import { provider } from "../services/dataProvider.js";
import { getDb, query } from '../utils/db.js';


// Simple in-memory OTP store (replace with Redis in production)
const otpStore = new Map();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || process.env.VITE_SMTP_HOST || 'panel404.harmondns.net',
    port: process.env.SMTP_PORT || process.env.VITE_SMTP_PORT || 465,
    secure: false,
    auth: {
        user: process.env.SMTP_USER || process.env.VITE_SMTP_USER,
        pass: process.env.SMTP_PASS || process.env.VITE_SMTP_PASS,
    }
});

function generateOTP() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otp);
    return otp;
}

async function sendOTPEmail(email, otp) {
    const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.VITE_EMAIL_FROM || 'noreply@cfdtradingpro.com',
        to: email,
        subject: 'CFD Trading Pro - Verification Code',
        text: `
        Hello,

Thanks for choosing CFD Trading Pro. Your verification code is ${otp}.

Enter this code on the sign-up page to complete your registration. The code expires in 10 minutes.

If you did not request this email, please ignore it.

Best regards,
CFD Trading Team`,
        html: `
            <div style="font-family:Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#f8fafc; padding:32px;">
                <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:24px; overflow:hidden; box-shadow:0 24px 80px rgba(15,23,42,0.12);">
                    <div style="background:#0f172a; padding:32px 24px; text-align:center;">
                        <img src="https://cfdtradingpro.com/logo192.png" alt="CFD Trading Pro" width="64" height="64" style="display:block; margin:0 auto 16px;" />
                        <h1 style="color:#ffffff; font-size:28px; margin:0;">Welcome to CFD Trading Pro</h1>
                        <p style="color:#94a3b8; margin:12px 0 0; font-size:15px; line-height:1.6;">Secure your account with a one-time verification code.</p>
                    </div>
                    <div style="padding:32px 32px 24px; color:#0f172a;">
                        <p style="margin:0 0 20px; font-size:16px; line-height:1.75; color:#475569;">Hi there,</p>
                        <p style="margin:0 0 24px; font-size:16px; line-height:1.75; color:#475569;">
                            Thanks for signing up with CFD Trading Pro. Use the code below to verify your email address and complete your registration.
                        </p>
                        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:28px 24px; text-align:center; margin-bottom:32px;">
                            <p style="margin:0 0 12px; font-size:14px; color:#64748b; letter-spacing:0.08em; text-transform:uppercase;">Your verification code</p>
                            <p style="margin:0; font-size:32px; letter-spacing:0.2em; font-weight:700; color:#0f172a;">${otp}</p>
                        </div>
                        <a href="https://cfdtradingpro.com/login" style="display:inline-block; background:#0ea5e9; color:#ffffff; text-decoration:none; padding:14px 26px; border-radius:999px; font-size:16px; font-weight:600;">Verify my account</a>
                        <p style="margin:28px 0 0; font-size:14px; line-height:1.8; color:#64748b;">
                            This code expires in 10 minutes. If you did not request this verification, you can safely ignore this message.
                        </p>
                        <p style="margin:24px 0 0; font-size:14px; line-height:1.8; color:#64748b;">
                            Need help? Visit our <a href="https://t.me/cfd_support/" style="color:#0ea5e9; text-decoration:none;">support center</a>.
                        </p>
                    </div>
                    <div style="background:#f8fafc; padding:20px 24px; text-align:center; font-size:13px; color:#94a3b8;">
                        <p style="margin:0;">CFD Trading Pro • Secure trading and global markets</p>
                    </div>
                </div>
            </div>
        
        `,
    };
    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (e) {
        console.error('Failed to send email', e.message || e);
        return false;
    }
}

export async function sendOtp(req, res) {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Missing email' });
        // check if user exists
        const existing = await query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);

        if (existing && existing[0]) {
            return res.status(400).json({
                message: 'Email already registered'
            });
        }
        const otp = generateOTP();
        console.log(`Generated OTP for ${email}: ${otp}`); // local dev only
        otpStore.set(email, { otp, ts: Date.now() });
        

        // ===== FOR PRODUCTION =======

        if (process.env.NODE_ENV === 'production' || process.env.VITE_APP_ENV === 'production') {
             await sendOTPEmail(email, otp);
               return res.json({ success: true })
        } else {
            console.log(`📧 [DEV MODE] OTP would be sent to ${email}: ${otp}`);
            return res.json({ success: true, devOtp: otp }); // Include OTP for testing/locally
        }
        
        const sent = await sendOTPEmail(email, otp);
        if (!sent) return res.status(500).json({ message: 'Failed to send OTP' });
        return res.json({ success: true });
    } catch (e) {
        console.error('❌ SendOtp error:', e.message || e);
        console.error('❌ Stack:', e.stack);
        return res.status(500).json({ message: 'Server error: ' + (e.message || 'Unknown') });
    }
}

export async function verifyOtp(req, res) {
    try {
        const { email, otp, userData } = req.body;
        if (!email || !otp || !userData) return res.status(400).json({ message: 'Missing params' });
        const stored = otpStore.get(email);
        if (!stored) return res.status(400).json({ message: 'OTP not found' });
        if (Date.now() - stored.ts > 10 * 60 * 1000) { otpStore.delete(email); return res.status(400).json({ message: 'OTP expired' }); }
        if (stored.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

        // insert new user with plain password (insecure; per user request)
        const doc = {
            email,
            password: userData.password,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            username: userData.username || '',
            country: userData.country || '',
            currency: userData.currency || 'USD',
            accountType: userData.accountType || 'individual',
            dateOfBirth: userData.dateOfBirth || null,
            role: 'trader',
            emailVerified: true,
            createdAt: new Date(),
            balanceUsd: 0,
            roi: 0
        };

        const insertResult = await provider.insertOne('users', doc);
        const insertedId = insertResult?.insertedId || insertResult?._id || null;

        otpStore.delete(email);
        return res.json({ success: true, id: insertedId });
    } catch (e) {
        console.error('❌ VerifyOtp error:', e.message || e);
        console.error('❌ Stack:', e.stack);
        return res.status(500).json({ message: 'Server error: ' + (e.message || 'Unknown') });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        console.log('🔄 User login attempt:', { email, ip: req.ip });
        if (!email || !password) {
            console.log('❌ Missing email or password');
            return res.status(400).json({ message: 'Missing credentials' });
        }
        
        const db = getDb();
        if (!db && process.env.NODE_ENV === 'production') {
            console.error('❌ User login failed because database is not connected');
            return res.status(500).json({ message: 'Database not connected' });
        }

        console.log('🔍 Looking up user for email:', email);
        const user = await provider.findOne('users', { email });

        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        console.log('👤 User found:', { id: user.id, email: user.email, role: user.role });
        
        if (password !== user.password) {
            console.log('❌ Password mismatch for user:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if user is banned
        if (user.banned) {
            console.log('🚫 User is banned:', email);
            return res.status(403).json({ 
                success: false, 
                message: 'Your account has been banned and you cannot login. Please contact support.' 
            });
        }

        console.log('✅ Password match, generating token for user:', email);
        
        // Generate JWT token for frontend
        const jwt = await import('jsonwebtoken').then(m => m.default);
        const token = jwt.sign(
            { sub: Number(user.id || user._id), role: user.role },
            process.env.JWT_SECRET || process.env.VITE_JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || process.env.VITE_JWT_EXPIRES_IN || '24h' }
        );
        console.log('✅ Token generated, setting httpOnly cookie');
        
        // Set httpOnly cookie so token is automatically included in requests
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' || process.env.VITE_APP_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' || process.env.VITE_APP_ENV === 'production' ? 'None' : 'Lax',
            domain: process.env.COOKIE_DOMAIN || undefined,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            path: '/',
        });
        
        return res.json({ 
            success: true, 
            token,
            user: { 
                id: Number(user.id || user._id), 
                email: user.email, 
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName
            } 
        });
    } catch (e) {
        console.error('❌ Login error:', e.message || e);
        console.error('❌ Full error stack:', e.stack);
        return res.status(500).json({ message: 'Server error: ' + (e.message || 'Unknown error') });
    }
}

export async function me(req, res) {
    try {
        // `authenticate` attaches full user object to req.user
        const user = req.user;

        if (!user || !user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const found = await provider.findOne('users', { id: user.id });
        if (!found) return res.status(404).json({ message: 'User not found' });
        return res.json(found);
    } catch (err) {
        console.error('❌ Me error:', err.message || err);
        console.error('❌ Stack:', err.stack);
        return res.status(500).json({ message: 'Server error: ' + (err.message || 'Unknown') });
    }
}

