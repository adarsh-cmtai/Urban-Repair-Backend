const Booking = require('../../models/booking.model');
const User = require('../../models/user.model');
const crypto = require('crypto');
const sendEmail = require('../../utils/sendEmail');
const Razorpay = require('razorpay');


const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const offerJobToTechnicians = async (req, res) => {
    const { technicianIds } = req.body;
    if (!technicianIds || !Array.isArray(technicianIds) || technicianIds.length === 0) {
        return res.status(400).json({ success: false, message: 'An array of technician IDs is required.' });
    }

    try {
        const completionOTP = crypto.randomInt(100000, 999999).toString();

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { 
                $addToSet: { offeredTo: { $each: technicianIds } },
                status: 'Offered',
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
        
        res.status(200).json({ success: true, message: `Job offered to ${technicianIds.length} technician(s).`, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while offering job.' });
    }
};

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
    const { id: bookingId } = req.params;

    if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required.' });
    }
    
    try {
        const booking = await Booking.findById(bookingId).populate('customerId', 'name email');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }
        
        if (booking.status === 'Cancelled' || booking.status === 'Completed') {
            return res.status(400).json({ success: false, message: `This booking is already ${booking.status.toLowerCase()}.` });
        }

        if (status === 'Cancelled') {
            if (booking.paymentMethod === 'Online' && booking.paymentStatus === 'Paid' && booking.paymentDetails?.paymentId) {
                try {
                    const refund = await instance.payments.refund(booking.paymentDetails.paymentId, {
                        amount: booking.finalAmount * 100,
                        speed: 'normal',
                        notes: {
                            reason: 'Booking cancelled by admin.',
                            bookingId: booking.bookingId,
                        }
                    });

                    booking.paymentStatus = 'Refunded';
                    booking.paymentDetails.refundId = refund.id;

                } catch (refundError) {
                    console.error("Razorpay refund error:", refundError);
                    return res.status(500).json({ success: false, message: 'Failed to process refund. Please try again or contact Razorpay support.' });
                }
            }
            
            if (booking.customerId && booking.customerId.email) {
                const customer = booking.customerId;
                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2>Booking Cancelled: #${booking.bookingId}</h2>
                        <p>Hi ${customer.name},</p>
                        <p>We are writing to inform you that your service booking with Urban Repair has been cancelled by our team.</p>
                        ${booking.paymentMethod === 'Online' && booking.paymentStatus === 'Refunded' ? `
                        <div style="background-color: #e8f5e9; border-left: 4px solid #4CAF50; padding: 15px; margin: 15px 0;">
                            <h3 style="margin-top: 0;">Refund Processed</h3>
                            <p>A full refund of <strong>₹${booking.finalAmount.toLocaleString('en-IN')}</strong> has been initiated for your payment. It should reflect in your original payment method within 5-7 business days.</p>
                            <p><strong>Refund ID:</strong> ${booking.paymentDetails.refundId}</p>
                        </div>
                        ` : ''}
                        <p>We apologize for any inconvenience this may cause. If you have any questions, please feel free to contact our support team.</p>
                    </div>`;

                try {
                    await sendEmail({
                        email: customer.email,
                        subject: `Important: Your Urban Repair Booking #${booking.bookingId} has been cancelled`,
                        html: emailHtml,
                    });
                } catch (emailError) {
                    console.error("Failed to send cancellation email:", emailError);
                }
            }
        }
        
        booking.status = status;
        await booking.save();
        
        res.status(200).json({ success: true, message: `Booking status updated to ${status}.`, data: booking });
    } catch (error) {
        console.error("Update status error:", error);
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
    offerJobToTechnicians,
    deleteBooking,
};