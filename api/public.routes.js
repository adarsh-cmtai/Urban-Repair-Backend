const express = require('express');
const router = express.Router();
const Category = require('../models/category.model');
const Service = require('../models/service.model');
const SubService = require('../models/subService.model');
const mongoose = require('mongoose');
const Testimonial = require('../models/testimonial.model');
const Location = require('../models/location.model');
const NodeGeocoder = require('node-geocoder');
const BuybackCategory = require('../models/buybackCategory.model');

const geocoder = NodeGeocoder({
    provider: 'openstreetmap',
    userAgent: 'Urban Repair App / 1.0',
    timeout: 7000, 
});

router.get('/locations/by-pincode', async (req, res) => {
    const { pincode } = req.query;
    if (!pincode) {
        return res.status(400).json({ success: false, message: 'Pincode is required.' });
    }
    try {
        const locations = await Location.find({ pincode, isServiceable: true });
        if (locations && locations.length > 0) {
            return res.status(200).json({ success: true, data: locations });
        }
        return res.status(404).json({ success: false, message: 'No serviceable locations found for this pincode.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while searching by pincode.' });
    }
});


router.get('/locations/by-coords', async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ success: false, message: 'Latitude and longitude are required.' });
    }

    try {
        const geoResult = await geocoder.reverse({ lat: parseFloat(lat), lon: parseFloat(lon) });

        if (geoResult && geoResult.length > 0 && geoResult[0].zipcode) {
            const pincode = geoResult[0].zipcode;
            const locations = await Location.find({ pincode, isServiceable: true });

            if (locations && locations.length > 0) {
                return res.status(200).json({ success: true, data: locations });
            }
        }
        
        return res.status(404).json({ success: false, message: 'Sorry, your current location is not serviceable.' });

    } catch (error) {
        console.error("Reverse geocoding error on Vercel:", error);
        res.status(500).json({ success: false, message: 'Could not determine location from coordinates.' });
    }
});

router.get('/services-by-category', async (req, res) => {
    try {
        const { locationId } = req.query;

        let serviceMatchCondition = { isActive: true };
        if (locationId) {
            if (!mongoose.Types.ObjectId.isValid(locationId)) {
                return res.status(400).json({ success: false, message: 'Invalid location ID format' });
            }
            serviceMatchCondition = {
                ...serviceMatchCondition,
                $or: [
                    { serviceableLocations: { $size: 0 } },
                    { serviceableLocations: new mongoose.Types.ObjectId(locationId) }
                ]
            };
        }

        const categoriesWithServices = await Category.aggregate([
            { $match: { isActive: true } },
            {
                $lookup: {
                    from: 'services',
                    localField: '_id',
                    foreignField: 'categoryId',
                    as: 'services',
                    pipeline: [
                        { $match: serviceMatchCondition },
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
            },
            {
                $match: {
                    "services.0": { "$exists": true }
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

router.get('/buyback-services', async (req, res) => {
    try {
        const services = await Service.find({ type: 'Sell', isActive: true })
            .populate('categoryId', 'name');
        res.status(200).json({ success: true, data: services });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

router.get('/buyback-catalog-full', async (req, res) => {
    try {
        const { locationId } = req.query;

        let brandMatchCondition = { isActive: true };
        if (locationId && mongoose.Types.ObjectId.isValid(locationId)) {
            brandMatchCondition = {
                ...brandMatchCondition,
                $or: [
                    { serviceableLocations: { $size: 0 } },
                    { serviceableLocations: new mongoose.Types.ObjectId(locationId) }
                ]
            };
        }

        const fullCatalog = await BuybackCategory.aggregate([
            { $match: { isActive: true } },
            {
                $lookup: {
                    from: 'buybackcapacities',
                    localField: '_id',
                    foreignField: 'categoryId',
                    as: 'capacities',
                    pipeline: [
                        { $match: { isActive: true } },
                        {
                            $lookup: {
                                from: 'buybackbrands',
                                localField: '_id',
                                foreignField: 'capacityId',
                                as: 'brands',
                                pipeline: [{ $match: brandMatchCondition }]
                            }
                        },
                        { $match: { "brands.0": { "$exists": true } } }
                    ]
                }
            },
            { $match: { "capacities.0": { "$exists": true } } }
        ]);
        res.status(200).json({ success: true, data: fullCatalog });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});


module.exports = router;