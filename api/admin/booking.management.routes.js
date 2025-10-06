const express = require('express');
const router = express.Router();

const {
    getAllBookings,
    getBookingById,
    assignTechnician,
    updateBookingStatus,
    rescheduleBooking,
    deleteBooking,
    offerJobToTechnicians,
} = require('./booking.management.controller');

router.get('/', getAllBookings);
router.get('/:id', getBookingById);
router.delete('/:id', deleteBooking);
router.patch('/:id/assign', assignTechnician);
router.patch('/:id/status', updateBookingStatus);
router.patch('/:id/reschedule', rescheduleBooking);
router.patch('/:id/offer', offerJobToTechnicians);

module.exports = router;