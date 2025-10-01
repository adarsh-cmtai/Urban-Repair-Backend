const User = require('../../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../../utils/sendEmail');

const registerUser = async (req, res) => {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const emailVerificationOtp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000;

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role: role || 'customer',
            emailVerificationOtp: emailVerificationOtp,
            emailVerificationOtpExpires: otpExpires,
        });

        await sendEmail({
            email: newUser.email,
            subject: 'Your Email Verification OTP',
            html: `<p>Your verification OTP is: <b>${emailVerificationOtp}</b></p>`,
        });

        res.status(201).json({ 
            success: true, 
            message: `Registration successful! An OTP has been sent to ${newUser.email}.`,
            data: { email: newUser.email }
        });

    } catch (error) {
        console.error("REGISTRATION FAILED:", error);
        return res.status(500).json({ 
            success: false, 
            message: 'An internal server error occurred. Please check the server logs.' 
        });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const verifyEmailOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }
    try {
        const user = await User.findOne({ 
            email,
            emailVerificationOtp: otp,
            emailVerificationOtpExpires: { $gt: Date.now() } 
        });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
        }
        user.isEmailVerified = true;
        user.emailVerificationOtp = undefined;
        user.emailVerificationOtpExpires = undefined;
        await user.save();
        res.status(200).json({ success: true, message: 'Email verified successfully! You can now log in.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error during email verification.' });
    }
};

const resendOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        if (user.isEmailVerified) {
            return res.status(400).json({ success: false, message: 'This account is already verified.' });
        }
        const emailVerificationOtp = crypto.randomInt(100000, 999999).toString();
        user.emailVerificationOtp = emailVerificationOtp;
        user.emailVerificationOtpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();
        await sendEmail({ email, subject: 'New Verification OTP', html: `<p>Your new verification OTP is: <b>${emailVerificationOtp}</b></p>` });
        res.status(200).json({ success: true, message: 'A new OTP has been sent to your email.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while resending OTP.' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }
    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
        if (!user.isEmailVerified) {
            return res.status(403).json({ success: false, message: 'Please verify your email before logging in.' });
        }
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        const userResponse = { _id: user._id, name: user.name, email: user.email, role: user.role };
        res.status(200).json({ success: true, message: 'Logged in successfully.', token, user: userResponse });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error during login.' });
    }
};

module.exports = {
    getMe,
    registerUser,
    verifyEmailOtp,
    resendOtp,
    loginUser,
};