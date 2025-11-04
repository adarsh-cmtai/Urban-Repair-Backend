const mongoose = require('mongoose');

const buybackCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('BuybackCategory', buybackCategorySchema);