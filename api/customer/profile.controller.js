const User = require('../../models/user.model');
const bcrypt = require('bcryptjs');

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const updateUserProfile = async (req, res) => {
    const { name, phone } = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { name, phone },
            { new: true, runValidators: true }
        );
        res.status(200).json({ success: true, message: 'Profile updated successfully', data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        user.addresses.push(req.body);
        await user.save();
        res.status(201).json({ success: true, message: 'Address added successfully', data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const updateAddress = async (req, res) => {
    const { addressId } = req.params;
    const { label, street, city, state, zipCode } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const address = user.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }
        address.set({ label, street, city, state, zipCode });
        await user.save();
        res.status(200).json({ success: true, message: 'Address updated successfully', data: user.addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const deleteAddress = async (req, res) => {
    const { addressId } = req.params;
    try {
        const user = await User.findById(req.user.id);
        const address = user.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }
        address.remove();
        await user.save();
        res.status(200).json({ success: true, message: 'Address deleted successfully', data: user.addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Please provide old and new passwords' });
    }

    try {
        const user = await User.findById(req.user.id).select('+password');
        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect old password' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    changePassword,
};