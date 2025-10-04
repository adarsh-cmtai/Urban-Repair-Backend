const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    areaName: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    district: { type: String, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true, unique: true },
    isServiceable: { type: Boolean, default: true },
}, { timestamps: true });

locationSchema.index({ areaName: 'text', city: 'text', district: 'text', state: 'text', pincode: 'text' });

module.exports = mongoose.model('Location', locationSchema);