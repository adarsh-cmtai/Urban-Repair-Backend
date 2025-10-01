const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../../models/booking.model');

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) => {
    try {
        const options = {
            amount: Number(req.body.amount * 100), // amount in the smallest currency unit
            currency: "INR",
        };
        const order = await instance.orders.create(options);
        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error creating order" });
    }
};

const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        await Booking.findByIdAndUpdate(bookingId, {
            paymentStatus: 'Paid',
            'paymentDetails.orderId': razorpay_order_id,
            'paymentDetails.paymentId': razorpay_payment_id,
        });
        res.redirect(`/payment-success?reference=${razorpay_payment_id}`);
    } else {
        await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'Failed' });
        res.status(400).json({ success: false, message: "Payment verification failed" });
    }
};

module.exports = { createOrder, verifyPayment };