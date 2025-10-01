const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
});

const faqSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
});

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true },
    duration: { type: String, required: true },
    inclusions: [String],
    exclusions: [String],
    howItWorks: [stepSchema],
    faqs: [faqSchema],
    isActive: { type: Boolean, default: true },
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

serviceSchema.virtual('subServices', {
    ref: 'SubService',
    localField: '_id',
    foreignField: 'serviceId'
});

module.exports = mongoose.model('Service', serviceSchema);