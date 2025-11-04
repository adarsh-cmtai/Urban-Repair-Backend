// File: src/api/technician/sell.request.job.controller.js

const SellRequest = require('../../models/sellRequest.model');

const getInspectionJobs = async (req, res) => {
    const technicianId = req.user.id;
    try {
        const inspectionJobs = await SellRequest.find({
            technicianId: technicianId,
            status: { $in: ['Inspection_Assigned', 'Pickup_Assigned'] } // Update to include pickup jobs
        })
        .populate('customerId', 'name phone')
        .populate('serviceId', 'name')
        .sort({ inspectionDate: 1 });

        res.status(200).json({ success: true, count: inspectionJobs.length, data: inspectionJobs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching jobs.' });
    }
};

const submitInspectionReport = async (req, res) => {
    const { notes, suggestedPrice } = req.body;
    const { id: sellRequestId } = req.params;
    const technicianId = req.user.id;

    if (!suggestedPrice || suggestedPrice <= 0) {
        return res.status(400).json({ success: false, message: 'A valid suggested price is required.' });
    }
    try {
        const sellRequest = await SellRequest.findOne({ _id: sellRequestId, technicianId: technicianId });

        if (!sellRequest) {
            return res.status(404).json({ success: false, message: 'Sell request not found or not assigned to you.' });
        }
        if (sellRequest.status !== 'Inspection_Assigned') {
            return res.status(400).json({ success: false, message: `Cannot submit report. Current status is ${sellRequest.status}.` });
        }
        sellRequest.inspectionReport = { notes, suggestedPrice, inspectedAt: new Date() };
        sellRequest.status = 'Inspected';
        await sellRequest.save();

        res.status(200).json({ success: true, message: 'Inspection report submitted successfully.', data: sellRequest });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while submitting inspection report.' });
    }
};

const confirmPickupAndPayment = async (req, res) => {
    const { id: sellRequestId } = req.params;
    const technicianId = req.user.id;

    try {
        const sellRequest = await SellRequest.findOne({
            _id: sellRequestId,
            technicianId: technicianId
        });

        if (!sellRequest) {
            return res.status(404).json({ success: false, message: 'Sell request not found or not assigned to you.' });
        }
        if (sellRequest.status !== 'Pickup_Assigned') {
            return res.status(400).json({ success: false, message: `Cannot confirm pickup. Current status is ${sellRequest.status}.` });
        }

        sellRequest.status = 'Completed';
        sellRequest.paymentDetails.status = 'Paid';
        sellRequest.paymentDetails.amountPaid = sellRequest.offerPrice;
        sellRequest.paymentDetails.paidAt = new Date();

        await sellRequest.save();

        res.status(200).json({
            success: true,
            message: 'Pickup confirmed and payment recorded. The request is now complete.',
            data: sellRequest
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while confirming pickup.'
        });
    }
};

module.exports = {
    getInspectionJobs,
    submitInspectionReport,
    confirmPickupAndPayment // Export the new function
};