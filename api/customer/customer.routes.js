const express = require('express');
const router = express.Router();
const profileRoutes = require('./profile.routes');
const bookingRoutes = require('./booking.routes');
const dashboardRoutes = require('./dashboard.routes'); 
const { verifyToken } = require('../../middlewares/auth.middleware');
const { isCustomer } = require('../../middlewares/role.middleware');
const { createOrder, verifyPayment } = require('./payment.controller');
const sellRequestRoutes = require('./sell.request.routes');
const { getCustomerUploadUrl } = require('./upload.controller');

/*
 * ===================================================================
 *                    IMPORTANT SECURITY LAYERS
 * ===================================================================
 * Yahan 'router.use()' ka istemal karke hum neeche define kiye gaye 
 * sabhi routes par yeh middlewares automatically apply kar rahe hain.
 * 
 * Flow: Request -> verifyToken -> isCustomer -> Actual Route
 */

// 1. Verify that the user is logged in (has a valid token).
router.use(verifyToken);

// 2. After verifying the token, ensure the user's role is specifically 'customer'.
router.use(isCustomer);

// ===================================================================
//                        ROUTE DEFINITIONS
// ===================================================================

// Ab neeche diye gaye sabhi routes protected hain. Sirf ek logged-in customer 
// hi in tak pahunch sakta hai.

// Profile related routes (e.g., /api/customer/profile, /api/customer/profile/addresses)
router.use('/dashboard', dashboardRoutes);
router.use('/', profileRoutes);
router.use('/bookings', bookingRoutes);

router.get('/is-first-booking', async (req, res) => {
    try {
        const count = await Booking.countDocuments({ customerId: req.user.id });
        res.status(200).json({ success: true, data: { isFirstBooking: count === 0 } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

router.post('/payment/create-order', createOrder);
router.post('/payment/verify', verifyPayment);

router.post('/uploads/generate-url', getCustomerUploadUrl);
router.use('/sell-requests', sellRequestRoutes);

// Yahan aap future me booking se related routes bhi add kar sakte hain.
// Yeh routes bhi automatically upar diye gaye middlewares se protect ho jayenge.
// Example:
// const bookingRoutes = require('./booking.routes');
// router.use('/bookings', bookingRoutes); 
// (This will handle routes like /api/customer/bookings/new, /api/customer/bookings/:id etc.)


module.exports = router;