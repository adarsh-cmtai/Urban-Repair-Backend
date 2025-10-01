// src/middlewares/auth.middleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const verifyToken = async (req, res, next) => {
    let token;

    // Check if the Authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (e.g., "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using the secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user by ID from the token payload and attach it to the request object
            // We exclude the password from the user object
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'User not found.' });
            }

            next(); // Proceed to the next middleware or route handler
        } catch (error) {
            res.status(401).json({ success: false, message: 'Not authorized, token failed.' });
        }
    }

    if (!token) {
        res.status(401).json({ success: false, message: 'Not authorized, no token provided.' });
    }
};

module.exports = { verifyToken };