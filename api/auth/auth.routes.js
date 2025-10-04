const express = require('express');
const router = express.Router();
const {forgotPassword, resetPassword, getMe, registerUser, loginUser, verifyEmailOtp, resendOtp } = require('./auth.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');

router.get('/me', verifyToken, getMe);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyEmailOtp);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

module.exports = router;