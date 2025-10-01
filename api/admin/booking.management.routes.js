const express = require('express');
const router = express.Router();

const {
    getAllBookings,
    getBookingById,
    assignTechnician,
    updateBookingStatus,
    rescheduleBooking,
    deleteBooking,
} = require('./booking.management.controller');

router.get('/', getAllBookings);
router.get('/:id', getBookingById);
router.delete('/:id', deleteBooking);
router.patch('/:id/assign', assignTechnician);
router.patch('/:id/status', updateBookingStatus);
router.patch('/:id/reschedule', rescheduleBooking);

module.exports = router;