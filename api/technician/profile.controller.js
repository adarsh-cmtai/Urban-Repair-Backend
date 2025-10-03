const User = require('../../models/user.model');
const Booking = require('../../models/booking.model');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const getTechnicianProfile = async (req, res) => {
    try {
        const technicianId = new mongoose.Types.ObjectId(req.user.id);
        
        const [technician, ratingData, jobs] = await Promise.all([
            User.findById(req.user.id).select('-password'),
            Booking.aggregate([
                { $match: { technicianId: technicianId, 'review.rating': { $exists: true } } },
                { $group: { _id: '$technicianId', averageRating: { $avg: '$review.rating' }, totalReviews: { $sum: 1 } } }
            ]),
            Booking.find({ technicianId: technicianId, 'review.rating': { $exists: true } })
                .populate('customerId', 'name')
                .sort({ updatedAt: -1 })
                .select('review serviceType items customerId updatedAt')
        ]);

        if (!technician) {
            return res.status(404).json({ success: false, message: 'Technician not found.' });
        }
        
        const profileData = technician.toObject();
        profileData.averageRating = ratingData.length > 0 ? parseFloat(ratingData[0].averageRating.toFixed(2)) : 0;
        profileData.totalReviews = ratingData.length > 0 ? ratingData[0].totalReviews : 0;
        profileData.reviews = jobs;

        res.status(200).json({ success: true, data: profileData });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching profile.' });
    }
};

const updateTechnicianProfile = async (req, res) => {
    const { name, phone, specialization } = req.body;
    
    try {
        const updatedTechnician = await User.findByIdAndUpdate(
            req.user.id,
            { name, phone, specialization },
            { new: true, runValidators: true }
        ).select('-password');
        
        res.status(200).json({ success: true, message: 'Profile updated successfully.', data: updatedTechnician });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while updating profile.' });
    }
};

const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Please provide both old and new passwords.' });
    }

    try {
        const user = await User.findById(req.user.id).select('+password');
        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect old password.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ success: true, message: 'Password changed successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while changing password.' });
    }
};

module.exports = {
    getTechnicianProfile,
    updateTechnicianProfile,
    changePassword,
};