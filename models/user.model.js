const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    label: { type: String, enum: ['Home', 'Office', 'Other'], required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, required: true },
    role: {
        type: String,
        enum: ['customer', 'technician', 'admin'],
        default: 'customer'
    },
    specialization: { type: String, trim: true },
    addresses: [addressSchema],
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationOtp: String,
    emailVerificationOtpExpires: Date,
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;