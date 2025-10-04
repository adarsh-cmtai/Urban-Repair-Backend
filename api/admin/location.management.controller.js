const Location = require('../../models/location.model');

const createLocation = async (req, res) => {
    try {
        const newLocation = await Location.create(req.body);
        res.status(201).json({ success: true, data: newLocation });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'Pincode already exists.' });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

const getAllLocations = async (req, res) => {
    try {
        const locations = await Location.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: locations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateLocation = async (req, res) => {
    try {
        const updatedLocation = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedLocation) return res.status(404).json({ success: false, message: 'Location not found' });
        res.status(200).json({ success: true, data: updatedLocation });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteLocation = async (req, res) => {
    try {
        const deleted = await Location.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Location not found' });
        res.status(200).json({ success: true, message: 'Location deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createLocation, getAllLocations, updateLocation, deleteLocation };