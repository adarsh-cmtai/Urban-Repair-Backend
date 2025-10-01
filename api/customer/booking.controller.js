// src/api/customer/booking.controller.js
const Booking = require('../../models/booking.model');
const User = require('../../models/user.model');

const createNewBooking = async (req, res) => {
    const { 
        items, addressId, preferredDate, timeSlot, 
        totalAmount, discount, finalAmount, paymentMethod, paymentDetails 
    } = req.body;
    
    try {
        const customer = await User.findById(req.user.id);
        const selectedAddress = customer.addresses.id(addressId);

        if (!selectedAddress) {
            return res.status(404).json({ success: false, message: 'Address not found.' });
        }

        const newBooking = await Booking.create({
            bookingId: `UR${Date.now()}`,
            customerId: req.user.id,
            items: items.map((item) => ({
                serviceId: item.serviceId,
                subServiceId: item.subService._id,
                serviceName: item.serviceName,
                subServiceName: item.subService.name,
                quantity: item.quantity,
                price: item.price,
            })),
            address: selectedAddress,
            preferredDate,
            timeSlot,
            totalAmount,
            discount,
            finalAmount,
            paymentMethod,
            paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
            paymentDetails,
        });

        res.status(201).json({ success: true, message: 'Booking confirmed!', data: newBooking });
    } catch (error) {
        console.error("Booking creation error:", error);
        res.status(500).json({ success: false, message: 'Server error while creating booking.' });
    }
};


const getCustomerBookings = async (req, res) => {
    const { status } = req.query;
    let query = { customerId: req.user.id };

    if (status) {
        if (status === 'upcoming') {
            query.status = { $in: ['Pending', 'Confirmed', 'Assigned', 'InProgress', 'Rescheduled'] };
        } else {
            query.status = status;
        }
    }

    try {
        const bookings = await Booking.find(query)
            .sort({ preferredDate: -1, createdAt: -1 })
            .populate('technicianId', 'name phone');

        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching bookings.' });
    }
};

const getBookingDetails = async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.id,
            customerId: req.user.id
        }).populate('technicianId', 'name phone');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found or you do not have permission to view it.' });
        }

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching booking details.' });
    }
};

const submitBookingReview = async (req, res) => {
    const { rating, comment } = req.body;
    const { id: bookingId } = req.params;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'Please provide a valid rating between 1 and 5.' });
    }

    try {
        const booking = await Booking.findOne({
            _id: bookingId,
            customerId: req.user.id
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found or you are not authorized to review it.' });
        }

        if (booking.status !== 'Completed') {
            return res.status(400).json({ success: false, message: 'You can only review a completed service.' });
        }

        if (booking.review && booking.review.rating) {
            return res.status(400).json({ success: false, message: 'You have already submitted a review for this service.' });
        }

        booking.review = { rating, comment };
        await booking.save();

        res.status(201).json({ success: true, message: 'Thank you for your feedback!', data: booking.review });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while submitting the review.' });
    }
};

module.exports = {
    createNewBooking,
    getCustomerBookings,
    getBookingDetails,
    submitBookingReview,
};