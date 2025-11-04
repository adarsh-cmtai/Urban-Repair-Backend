const mongoose = require('mongoose');

const evaluationDataSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true }
}, { _id: false });

const sellRequestSchema = new mongoose.Schema({
    requestId: { type: String, required: true, unique: true, uppercase: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    buybackCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'BuybackCategory', required: true },
    buybackCapacityId: { type: mongoose.Schema.Types.ObjectId, ref: 'BuybackCapacity', required: true },
    buybackBrandId: { type: mongoose.Schema.Types.ObjectId, ref: 'BuybackBrand', required: true },
    
    status: {
        type: String,
        enum: ['Pending', 'Contacted', 'Negotiating', 'Deal_Won', 'Deal_Lost', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    estimatedPrice: { type: Number, default: 0 },
    evaluationData: [evaluationDataSchema],
    productImages: [{ type: String, required: true }],
    address: {
        label: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
    },
    inspectionDate: { type: Date, required: true },
    inspectionTimeSlot: { type: String, required: true },
    technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    inspectionReport: {
        notes: { type: String },
        suggestedPrice: { type: Number, default: 0 },
        inspectedAt: { type: Date }
    },
    offerPrice: { type: Number, default: 0 },
    paymentDetails: {
        method: { type: String, enum: ['Cash'], default: 'Cash' },
        amountPaid: { type: Number, default: 0 },
        paidAt: { type: Date },
        status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' }
    }
}, { timestamps: true });

const SellRequest = mongoose.model('SellRequest', sellRequestSchema);

module.exports = SellRequest;