const mongoose = require('mongoose');

const buybackCapacitySchema = new mongoose.Schema({
    name: { // Example: "1.5 Ton", "250 Litres"
        type: String,
        required: true,
        trim: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BuybackCategory',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('BuybackCapacity', buybackCapacitySchema);