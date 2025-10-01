// src/api/customer/booking.routes.js
const express = require('express');
const router = express.Router();

const {
    createNewBooking,
    getCustomerBookings,
    getBookingDetails,
    submitBookingReview,
} = require('./booking.controller');

router.post('/new', createNewBooking);
router.get('/', getCustomerBookings);
router.get('/:id', getBookingDetails);
router.post('/:id/review', submitBookingReview); // New route for submitting a review

module.exports = router;