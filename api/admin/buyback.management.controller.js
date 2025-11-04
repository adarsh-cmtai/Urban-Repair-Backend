// File: src/api/admin/buyback.management.controller.js
const Service = require('../../models/service.model');

const getAllBuybackServices = async (req, res) => {
    try {
        const services = await Service.find({ type: 'Sell' })
            .populate('categoryId', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: services });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getBuybackServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service || service.type !== 'Sell') {
            return res.status(404).json({ success: false, message: 'Buyback service not found' });
        }
        res.status(200).json({ success: true, data: service });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createBuybackService = async (req, res) => {
    try {
        const serviceData = { ...req.body, type: 'Sell' };
        const newService = await Service.create(serviceData);
        res.status(201).json({ success: true, data: newService });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const updateBuybackService = async (req, res) => {
    try {
        const serviceData = { ...req.body, type: 'Sell' };
        const updatedService = await Service.findByIdAndUpdate(req.params.id, serviceData, { new: true, runValidators: true });
        if (!updatedService) {
            return res.status(404).json({ success: false, message: 'Buyback service not found' });
        }
        res.status(200).json({ success: true, data: updatedService });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteBuybackService = async (req, res) => {
    try {
        const deletedService = await Service.findByIdAndDelete(req.params.id);
        if (!deletedService) {
            return res.status(404).json({ success: false, message: 'Buyback service not found' });
        }
        res.status(200).json({ success: true, message: 'Buyback service deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllBuybackServices,
    createBuybackService,
    getBuybackServiceById,
    updateBuybackService,
    deleteBuybackService
};