const SellRequest = require('../../models/sellRequest.model');
const User = require('../../models/user.model');
const sendEmail = require('../../utils/sendEmail');

async function callAIPricingModel(prompt) {
    console.log("--- Sending Prompt to AI ---");
    console.log(prompt);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const randomPrice = Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000;
    const roundedPrice = Math.round(randomPrice / 100) * 100;
    
    return {
        suggestedPrice: roundedPrice,
        reasoning: "Based on the brand reputation, age, and minor reported issues, this is a competitive market price. The price is adjusted for potential refurbishment costs."
    };
}

const getAllSellRequests = async (req, res) => {
    const { status, search } = req.query;
    let query = {};
    if (status) query.status = status;

    try {
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            const customers = await User.find({
                $or: [{ name: searchRegex }, { phone: searchRegex }],
                role: 'customer'
            }).select('_id');
            const customerIds = customers.map(c => c._id);
            query.customerId = { $in: customerIds };
        }
        const sellRequests = await SellRequest.find(query)
            .populate('customerId', 'name phone')
            .populate({ path: 'buybackBrandId', select: 'name' })
            .populate({ path: 'buybackCategoryId', select: 'name' })
            .populate('technicianId', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: sellRequests.length, data: sellRequests });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching sell requests.' });
    }
};

const getSellRequestById = async (req, res) => {
    try {
        const sellRequest = await SellRequest.findById(req.params.id)
            .populate('customerId', 'name email phone')
            .populate('buybackCategoryId', 'name')
            .populate('buybackCapacityId', 'name')
            .populate('buybackBrandId', 'name')
            .populate('technicianId', 'name phone specialization');

        if (!sellRequest) {
            return res.status(404).json({ success: false, message: 'Sell request not found.' });
        }
        res.status(200).json({ success: true, data: sellRequest });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching sell request details.' });
    }
};

const assignTechnicianForInspection = async (req, res) => {
    const { technicianId } = req.body;
    if (!technicianId) {
        return res.status(400).json({ success: false, message: 'Technician ID is required.' });
    }
    try {
        const sellRequest = await SellRequest.findByIdAndUpdate(
            req.params.id,
            { technicianId: technicianId, status: 'Inspection_Assigned' },
            { new: true, runValidators: true }
        );
        if (!sellRequest) return res.status(404).json({ success: false, message: 'Sell request not found.' });
        res.status(200).json({ success: true, message: 'Technician assigned for inspection successfully.', data: sellRequest });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while assigning technician.' });
    }
};

const assignTechnicianForPickup = async (req, res) => {
    const { technicianId } = req.body;
    if (!technicianId) {
        return res.status(400).json({ success: false, message: 'Technician ID is required.' });
    }
    try {
        const sellRequest = await SellRequest.findById(req.params.id);
        if (!sellRequest) return res.status(404).json({ success: false, message: 'Sell request not found.' });
        if (sellRequest.status !== 'Offer_Accepted') {
            return res.status(400).json({ success: false, message: 'Pickup can only be assigned after the customer accepts the offer.' });
        }
        sellRequest.technicianId = technicianId;
        sellRequest.status = 'Pickup_Assigned';
        await sellRequest.save();
        res.status(200).json({ success: true, message: 'Technician assigned for pickup.', data: sellRequest });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while assigning pickup.' });
    }
};

const updateSellRequestStatus = async (req, res) => {
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required.' });
    }
    try {
        const sellRequest = await SellRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!sellRequest) return res.status(404).json({ success: false, message: 'Sell request not found.' });
        res.status(200).json({ success: true, message: `Sell request status updated to ${status}.`, data: sellRequest });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while updating status.' });
    }
};

const makeFinalOffer = async (req, res) => {
    const { offerPrice } = req.body;
    if (!offerPrice || offerPrice <= 0) {
        return res.status(400).json({ success: false, message: 'A valid offer price is required.' });
    }
    try {
        const sellRequest = await SellRequest.findById(req.params.id).populate('customerId', 'name email').populate({ path: 'buybackBrandId', select: 'name' });
        if (!sellRequest) return res.status(404).json({ success: false, message: 'Sell request not found.' });
        if (sellRequest.status !== 'Inspected') {
            return res.status(400).json({ success: false, message: 'You can only make an offer after inspection.' });
        }
        sellRequest.offerPrice = offerPrice;
        sellRequest.status = 'Offer_Made';
        await sellRequest.save();

        if (sellRequest.customerId && sellRequest.customerId.email) {
            const emailHtml = `<h2>You have an offer for your ${sellRequest.buybackBrandId.name}!</h2><p>Hi ${sellRequest.customerId.name},</p><p>We are pleased to offer you a price of <strong>₹${offerPrice.toLocaleString('en-IN')}</strong>.</p><p>Please log in to your dashboard to accept or decline this offer.</p>`;
            await sendEmail({ email: sellRequest.customerId.email, subject: `An offer for your ${sellRequest.buybackBrandId.name}`, html: emailHtml });
        }
        res.status(200).json({ success: true, message: `Offer of ₹${offerPrice} made to the customer.`, data: sellRequest });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while making an offer.' });
    }
};

const generateSuggestedPrice = async (req, res) => {
    try {
        const sellRequest = await SellRequest.findById(req.params.id)
            .populate('buybackCategoryId', 'name')
            .populate('buybackCapacityId', 'name')
            .populate('buybackBrandId', 'name basePrice');

        if (!sellRequest) return res.status(404).json({ success: false, message: 'Request not found' });

        const { buybackCategoryId, buybackCapacityId, buybackBrandId, evaluationData } = sellRequest;
        const evaluationString = evaluationData.map(item => `- ${item.question}: ${item.answer}`).join('\n');

        const prompt = `You are an expert buyback pricing assistant. Your task is to suggest a fair and optimized resale price for a used product. Input Data: Product Category: ${buybackCategoryId.name}, Brand: ${buybackBrandId.name}, Capacity/Model: ${buybackCapacityId.name}, Base Market Price (New): ₹${buybackBrandId.basePrice}, Evaluation Responses: ${evaluationString}. Based on this, provide a JSON object with "suggestedPrice" (number) and "reasoning" (string).`;
        
        const aiResponse = await callAIPricingModel(prompt);
        res.status(200).json({ success: true, data: aiResponse });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to generate suggested price.' });
    }
};

module.exports = {
    getAllSellRequests,
    getSellRequestById,
    assignTechnicianForInspection,
    assignTechnicianForPickup,
    updateSellRequestStatus,
    makeFinalOffer,
    generateSuggestedPrice
};