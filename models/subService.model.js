const mongoose = require('mongoose');

const subServiceSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    price: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('SubService', subServiceSchema);