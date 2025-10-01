const User = require('../../models/user.model');
const Booking = require('../../models/booking.model');
const bcrypt = require('bcryptjs');

const createTechnician = async (req, res) => {
    const { name, email, password, phone, specialization } = req.body;

    if (!name || !email || !password || !phone) {
        return res.status(400).json({ success: false, message: 'Please provide name, email, password, and phone.' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Technician with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newTechnician = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            specialization,
            role: 'technician',
            isEmailVerified: true,
        });

        const userResponse = { ...newTechnician._doc };
        delete userResponse.password;

        res.status(201).json({ success: true, message: 'Technician created successfully.', data: userResponse });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while creating technician.' });
    }
};

const getAllTechnicians = async (req, res) => {
    try {
        const technicians = await User.find({ role: 'technician' })
            .select('-password -addresses -__v')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: technicians.length, data: technicians });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching technicians.' });
    }
};

const getTechnicianById = async (req, res) => {
    try {
        const [technician, jobs] = await Promise.all([
            User.findById(req.params.id).select('-password'),
            Booking.find({ technicianId: req.params.id })
                .populate('customerId', 'name')
                .sort({ createdAt: -1 })
        ]);

        if (!technician) {
            return res.status(404).json({ success: false, message: 'Technician not found.' });
        }

        res.status(200).json({ success: true, data: { profile: technician, jobs } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching technician details.' });
    }
};

const updateTechnician = async (req, res) => {
    const { name, email, phone, specialization, isActive, password } = req.body;
    let updates = { name, email, phone, specialization, isActive };

    try {
        if (password && password.length > 5) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(password, salt);
        }

        const updatedTechnician = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');

        if (!updatedTechnician) {
            return res.status(404).json({ success: false, message: 'Technician not found.' });
        }

        res.status(200).json({ success: true, message: 'Technician updated successfully.', data: updatedTechnician });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'Email already in use.' });
        }
        res.status(500).json({ success: false, message: 'Server error while updating technician.' });
    }
};

const deleteTechnician = async (req, res) => {
    try {
        const technician = await User.findByIdAndUpdate(req.params.id, { isActive: false });

        if (!technician) {
            return res.status(404).json({ success: false, message: 'Technician not found.' });
        }

        res.status(200).json({ success: true, message: 'Technician deactivated successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while deactivating technician.' });
    }
};

module.exports = {
    createTechnician,
    getAllTechnicians,
    getTechnicianById,
    updateTechnician,
    deleteTechnician,
};