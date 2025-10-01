const Category = require('../../models/category.model');
const Service = require('../../models/service.model');
const SubService = require('../../models/subService.model');
const { generateUploadUrl } = require('../../services/aws.s3.service');

const handleValidationError = (error, res) => {
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
};

const getUploadPresignedUrl = async (req, res) => {
    const { fileType } = req.body;
    if (!fileType) {
        return res.status(400).json({ success: false, message: 'fileType is required.' });
    }
    try {
        const { uploadURL, key } = await generateUploadUrl(fileType);
        const imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;
        res.status(200).json({ success: true, uploadURL, imageUrl });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error generating upload URL.' });
    }
};

const createCategory = async (req, res) => {
    try {
        const newCategory = await Category.create(req.body);
        res.status(201).json({ success: true, data: newCategory });
    } catch (error) {
        handleValidationError(error, res);
    }
};

const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateCategory = async (req, res) => {
    try {
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: updatedCategory });
    } catch (error) {
        handleValidationError(error, res);
    }
};

const deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndUpdate(req.params.id, { isActive: false });
        res.status(200).json({ success: true, message: 'Category deactivated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createService = async (req, res) => {
    try {
        const newService = await Service.create(req.body);
        res.status(201).json({ success: true, data: newService });
    } catch (error) {
        handleValidationError(error, res);
    }
};

const getAllServices = async (req, res) => {
    const { categoryId } = req.query;
    let query = {};
    if (categoryId) query.categoryId = categoryId;
    try {
        const services = await Service.find(query).populate('categoryId', 'name');
        res.status(200).json({ success: true, data: services });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateService = async (req, res) => {
    try {
        const updatedService = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: updatedService });
    } catch (error) {
        handleValidationError(error, res);
    }
};

const deleteService = async (req, res) => {
    try {
        await Service.findByIdAndUpdate(req.params.id, { isActive: false });
        res.status(200).json({ success: true, message: 'Service deactivated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createSubService = async (req, res) => {
    try {
        const newSubService = await SubService.create(req.body);
        res.status(201).json({ success: true, data: newSubService });
    } catch (error) {
        handleValidationError(error, res);
    }
};

const getAllSubServices = async (req, res) => {
    const { serviceId } = req.query;
    let query = {};
    if (serviceId) query.serviceId = serviceId;
    try {
        const subServices = await SubService.find(query).populate('serviceId', 'name');
        res.status(200).json({ success: true, data: subServices });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateSubService = async (req, res) => {
    try {
        const updatedSubService = await SubService.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: updatedSubService });
    } catch (error) {
        handleValidationError(error, res);
    }
};

const deleteSubService = async (req, res) => {
    try {
        await SubService.findByIdAndUpdate(req.params.id, { isActive: false });
        res.status(200).json({ success: true, message: 'Sub-service deactivated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getUploadPresignedUrl,
    createCategory, getAllCategories, updateCategory, deleteCategory,
    createService, getAllServices, updateService, deleteService,
    createSubService, getAllSubServices, updateSubService, deleteSubService,
};