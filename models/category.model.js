const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    imageUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model('Category', categorySchema);