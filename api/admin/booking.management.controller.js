const Booking = require('../../models/booking.model');
const User = require('../../models/user.model');
const crypto = require('crypto');
const sendEmail = require('../../utils/sendEmail');

const getAllBookings = async (req, res) => {
    const { status, technicianId, dateFrom, dateTo, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (technicianId) query.technicianId = technicianId;

    if (dateFrom && dateTo) {
        query.preferredDate = {
            $gte: new Date(dateFrom),
            $lte: new Date(dateTo)
        };
    }

    try {
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            const customers = await User.find({
                $or: [ { name: searchRegex }, { phone: searchRegex } ],
                role: 'customer'
            }).select('_id');
            const customerIds = customers.map(c => c._id);
            query.customerId = { $in: customerIds };
        }
        
        const bookings = await Booking.find(query)
            .populate('customerId', 'name phone')
            .populate('technicianId', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching bookings.' });
    }
};

const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('customerId', 'name email phone addresses')
            .populate('technicianId', 'name email phone specialization');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        console.error("Error fetching booking by ID for admin:", error);
        res.status(500).json({ success: false, message: 'Server error while fetching booking details.' });
    }
};

const assignTechnician = async (req, res) => {
    const { technicianId } = req.body;
    if (!technicianId) {
        return res.status(400).json({ success: false, message: 'Technician ID is required.' });
    }

    try {
        const completionOTP = crypto.randomInt(100000, 999999).toString();

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { 
                technicianId: technicianId, 
                status: 'Assigned',
                completionOTP: completionOTP 
            },
            { new: true }
        ).populate('customerId', 'name email');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }

        if (booking.customerId && booking.customerId.email) {
            const customer = booking.customerId;
            const emailHtml = `<p>Your service OTP is: <b>${completionOTP}</b></p>`;
            try {
                await sendEmail({
                    email: customer.email,
                    subject: `Service OTP for Booking #${booking.bookingId || booking._id.toString().slice(-6)}`,
                    html: emailHtml,
                });
            } catch (emailError) {
                console.error("Failed to send OTP email:", emailError);
            }
        }
        
        res.status(200).json({ success: true, message: 'Technician assigned and OTP sent to customer.', data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while assigning technician.' });
    }
};

const updateBookingStatus = async (req, res) => {
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required.' });
    }
    const allowedStatuses = ['Pending', 'Confirmed', 'Assigned', 'InProgress', 'Completed', 'Cancelled', 'Rescheduled'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status provided.' });
    }
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }
        res.status(200).json({ success: true, message: 'Booking status updated successfully.', data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while updating status.' });
    }
};

const rescheduleBooking = async (req, res) => {
    const { preferredDate, timeSlot } = req.body;
    if (!preferredDate || !timeSlot) {
        return res.status(400).json({ success: false, message: 'Preferred date and time slot are required.' });
    }
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, { preferredDate, timeSlot, status: 'Rescheduled' }, { new: true });
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }
        res.status(200).json({ success: true, message: 'Booking rescheduled successfully.', data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while rescheduling.' });
    }
};

const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }
        res.status(200).json({ success: true, message: 'Booking permanently deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while deleting booking.' });
    }
};

module.exports = {
    getAllBookings,
    getBookingById,
    assignTechnician,
    updateBookingStatus,
    rescheduleBooking,
    deleteBooking,
};