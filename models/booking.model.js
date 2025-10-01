const mongoose = require('mongoose');
const slugify = require('slugify');

const stepSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
});

const faqSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
});

const reviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please provide a rating between 1 and 5.'],
    },
    comment: {
        type: String,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const bookingItemSchema = new mongoose.Schema({
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    subServiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubService', required: true },
    serviceName: { type: String, required: true },
    subServiceName: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true },
});

const addressSubSchema = new mongoose.Schema({
    label: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
});

const bookingSchema = new mongoose.Schema({
    bookingId: { type: String, required: true, unique: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    
    // Fields for "Zomato-style" booking
    items: [bookingItemSchema],
    
    // Fields for old booking system (for backward compatibility)
    serviceType: { type: String },
    applianceType: { type: String },
    problemDescription: { type: [String] },

    address: addressSubSchema,
    preferredDate: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Confirmed', 'Assigned', 'InProgress', 'Completed', 'Cancelled', 'Rescheduled'], 
        default: 'Pending' 
    },
    
    // Technician-added fields
    technicianNotes: { type: String, trim: true },
    beforeServiceImage: { type: String },
    afterServiceImage: { type: String },
    serviceCharge: { type: Number, default: 0 },

    review: reviewSchema,

    // Payment fields
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['Online', 'COD'], required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Partial', 'Failed'], default: 'Pending' },
    paymentDetails: {
        orderId: String,
        paymentId: String,
    },

    completionOTP: { type: String, select: false },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);