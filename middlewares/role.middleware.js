// src/middlewares/role.middleware.js

// Middleware to check if the user is an Admin
const isAdmin = (req, res, next) => {
    // This middleware assumes that the 'verifyToken' middleware has already run
    // and attached the user object to the request.
    if (req.user && req.user.role === 'admin') {
        next(); // User is an admin, proceed to the next middleware or route handler
    } else {
        res.status(403).json({ 
            success: false, 
            message: 'Forbidden: Access is restricted to administrators only.' 
        });
    }
};

// Middleware to check if the user is a Technician
const isTechnician = (req, res, next) => {
    if (req.user && req.user.role === 'technician') {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            message: 'Forbidden: Access is restricted to technicians only.' 
        });
    }
};

// Middleware to check if the user is a Customer
const isCustomer = (req, res, next) => {
    if (req.user && req.user.role === 'customer') {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            message: 'Forbidden: Access is restricted to customers only.' 
        });
    }
};

// Middleware to check if the user is either a Technician OR an Admin
// Useful for routes that can be accessed by both, e.g., viewing booking details
const isTechnicianOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'technician' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            message: 'Forbidden: Access is restricted to technicians and administrators only.' 
        });
    }
};

module.exports = {
    isAdmin,
    isTechnician,
    isCustomer,
    isTechnicianOrAdmin,
};