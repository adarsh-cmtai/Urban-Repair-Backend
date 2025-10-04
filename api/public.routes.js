const express = require('express');
const router = express.Router();
const Category = require('../models/category.model');
const Service = require('../models/service.model');
const SubService = require('../models/subService.model');
const mongoose = require('mongoose');
const Testimonial = require('../models/testimonial.model');
const Location = require('../models/location.model');

router.get('/services-by-category', async (req, res) => {
    try {
        const categoriesWithServices = await Category.aggregate([
            { $match: { isActive: true } },
            {
                $lookup: {
                    from: 'services',
                    localField: '_id',
                    foreignField: 'categoryId',
                    as: 'services',
                    pipeline: [
                        { $match: { isActive: true } },
                        {
                            $lookup: {
                                from: 'subservices',
                                localField: '_id',
                                foreignField: 'serviceId',
                                as: 'subServices',
                                pipeline: [{ $match: { isActive: true } }]
                            }
                        }
                    ]
                }
            }
        ]);
        res.status(200).json({ success: true, data: categoriesWithServices });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

router.get('/services/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid service ID format' });
        }

        const service = await Service.findOne({ _id: req.params.id, isActive: true })
            .populate({
                path: 'subServices',
                match: { isActive: true }
            });

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        res.status(200).json({ success: true, data: service });
    } catch (error) {
        console.error(`Error fetching service with ID ${req.params.id}:`, error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});


router.get('/config', (req, res) => {
    res.status(200).json({ 
        success: true, 
        data: { 
            serviceablePincodes: ['110001', '110002', '110005', '500081'] 
        } 
    });
});

router.get('/catalog/categories', async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).select('name');
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

router.get('/catalog/services', async (req, res) => {
    const { categoryId } = req.query;
    if (!categoryId) return res.status(400).json({ success: false, message: 'Category ID is required.' });
    try {
        const services = await Service.find({ categoryId, isActive: true });
        res.status(200).json({ success: true, data: services });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

router.get('/catalog/sub-services', async (req, res) => {
    const { serviceId } = req.query;
    if (!serviceId) return res.status(400).json({ success: false, message: 'Service ID is required.' });
    try {
        const subServices = await SubService.find({ serviceId, isActive: true });
        res.status(200).json({ success: true, data: subServices });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

router.get('/testimonials', async (req, res) => {
    try {
        const testimonials = await Testimonial.find({ isActive: true }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: testimonials });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});


router.get('/locations/search', async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ success: false, message: 'Search query is required.' });
    }
    try {
        const searchRegex = new RegExp(query, 'i');

        const locations = await Location.find({
            $or: [
                { areaName: { $regex: searchRegex } },
                { city: { $regex: searchRegex } },
                { district: { $regex: searchRegex } },
                { state: { $regex: searchRegex } },
                { pincode: { $regex: searchRegex } }
            ],
            isServiceable: true
        });

        res.status(200).json({ success: true, data: locations });
    } catch (error) {
        console.error("Location search error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

router.get('/locations/list-areas', async (req, res) => {
    try {
        const locations = await Location.find({ isServiceable: true }).select('areaName').limit(10);
        res.status(200).json({ success: true, data: locations.map(l => l.areaName) });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;