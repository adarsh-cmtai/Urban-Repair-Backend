const mongoose = require('mongoose');

const conditionPricingSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
        trim: true
    },
    priceAdjustment: {
        type: Number,
        required: true,
        default: 0
    }
}, { _id: false });

const buybackBrandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    capacityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BuybackCapacity',
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BuybackCategory',
        required: true
    },
    basePrice: {
        type: Number,
        required: true,
        default: 0
    },
    evaluationQuestions: [{
        type: String,
        trim: true
    }],
    conditionPricing: [conditionPricingSchema],
    isActive: {
        type: Boolean,
        default: true
    },
    serviceableLocations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    }]
}, { timestamps: true });

module.exports = mongoose.model('BuybackBrand', buybackBrandSchema);