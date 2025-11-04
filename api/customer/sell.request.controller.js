const SellRequest = require('../../models/sellRequest.model');
const User = require('../../models/user.model');

const createSellRequest = async (req, res) => {
    const {
        buybackCategoryId,
        buybackCapacityId,
        buybackBrandId,
        evaluationData,
        estimatedPrice,
        productImages,
        addressId,
        inspectionDate,
        inspectionTimeSlot
    } = req.body;

    const customerId = req.user.id;

    if (!buybackCategoryId || !buybackCapacityId || !buybackBrandId || !evaluationData || !productImages || !addressId || !inspectionDate || !inspectionTimeSlot) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    try {
        const customer = await User.findById(customerId);
        if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });

        const selectedAddress = customer.addresses.id(addressId);
        if (!selectedAddress) return res.status(404).json({ success: false, message: 'Address not found.' });

        const newRequestId = `SR-${Date.now()}`;

        const newSellRequest = await SellRequest.create({
            requestId: newRequestId,
            customerId,
            buybackCategoryId,
            buybackCapacityId,
            buybackBrandId,
            evaluationData,
            estimatedPrice,
            productImages,
            address: selectedAddress.toObject(),
            inspectionDate,
            inspectionTimeSlot,
            status: 'Pending',
        });

        res.status(201).json({ success: true, message: 'Your request to sell has been submitted successfully!', data: newSellRequest });
    } catch (error) {
        console.error("Create Sell Request Error:", error);
        res.status(500).json({ success: false, message: 'Server error while creating your sell request.' });
    }
};

const getCustomerSellRequests = async (req, res) => {
    try {
        const sellRequests = await SellRequest.find({ customerId: req.user.id })
            .populate({ path: 'buybackBrandId', select: 'name imageUrl' })
            .populate({ path: 'buybackCategoryId', select: 'name' })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: sellRequests.length, data: sellRequests });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error fetching requests.' }); }
};

const getSellRequestDetailsForCustomer = async (req, res) => {
    try {
        const sellRequest = await SellRequest.findOne({ _id: req.params.id, customerId: req.user.id })
            .populate('buybackCategoryId', 'name')
            .populate('buybackCapacityId', 'name')
            .populate('buybackBrandId', 'name')
            .populate('technicianId', 'name phone');

        if (!sellRequest) return res.status(404).json({ success: false, message: 'Request not found.' });

        res.status(200).json({ success: true, data: sellRequest });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error fetching details.' }); }
};

const respondToOffer = async (req, res) => {
    const { response } = req.body;

    if (!response || !['Accepted', 'Declined'].includes(response)) {
        return res.status(400).json({ success: false, message: 'A valid response is required.' });
    }
    try {
        const sellRequest = await SellRequest.findOne({ _id: req.params.id, customerId: req.user.id });

        if (!sellRequest) return res.status(404).json({ success: false, message: 'Request not found.' });
        if (sellRequest.status !== 'Offer_Made') return res.status(400).json({ success: false, message: `Cannot respond now.` });

        sellRequest.status = response === 'Accepted' ? 'Offer_Accepted' : 'Offer_Declined';
        await sellRequest.save();

        const responseMessage = sellRequest.status === 'Offer_Accepted' ? 'Offer accepted! We will schedule a pickup.' : 'Offer has been declined.';
        res.status(200).json({ success: true, message: responseMessage, data: sellRequest });
    } catch (error) { res.status(500).json({ success: false, message: 'Server error while responding.' }); }
};

module.exports = { createSellRequest, getCustomerSellRequests, getSellRequestDetailsForCustomer, respondToOffer };