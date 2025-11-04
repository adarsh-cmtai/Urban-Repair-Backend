const BuybackCategory = require('../../models/buybackCategory.model');
const BuybackCapacity = require('../../models/buybackCapacity.model');
const BuybackBrand = require('../../models/buybackBrand.model');

// --- Category Controllers ---
exports.createCategory = async (req, res) => {
    try {
        const newCategory = await BuybackCategory.create(req.body);
        res.status(201).json({ success: true, data: newCategory });
    } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await BuybackCategory.find().sort({ name: 1 });
        res.status(200).json({ success: true, data: categories });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
exports.updateCategory = async (req, res) => {
    try {
        const updatedCategory = await BuybackCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: updatedCategory });
    } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};
exports.deleteCategory = async (req, res) => {
    try {
        await BuybackCategory.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Category deleted' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// --- Capacity Controllers ---
exports.createCapacity = async (req, res) => {
    try {
        const newCapacity = await BuybackCapacity.create(req.body);
        res.status(201).json({ success: true, data: newCapacity });
    } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};
exports.getCapacitiesByCategory = async (req, res) => {
    try {
        const capacities = await BuybackCapacity.find({ categoryId: req.query.categoryId }).sort({ name: 1 });
        res.status(200).json({ success: true, data: capacities });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
exports.updateCapacity = async (req, res) => {
    try {
        const updatedCapacity = await BuybackCapacity.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: updatedCapacity });
    } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};
exports.deleteCapacity = async (req, res) => {
    try {
        await BuybackCapacity.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Capacity deleted' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// --- Brand Controllers ---
exports.createBrand = async (req, res) => {
    try {
        const newBrand = await BuybackBrand.create(req.body);
        res.status(201).json({ success: true, data: newBrand });
    } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};
exports.getBrandsByCapacity = async (req, res) => {
    try {
        const brands = await BuybackBrand.find({ capacityId: req.query.capacityId }).sort({ name: 1 });
        res.status(200).json({ success: true, data: brands });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
exports.updateBrand = async (req, res) => {
    try {
        const updatedBrand = await BuybackBrand.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: updatedBrand });
    } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};
exports.deleteBrand = async (req, res) => {
    try {
        await BuybackBrand.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Brand deleted' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};