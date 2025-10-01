const User = require('../../models/user.model');
const Booking = require('../../models/booking.model');
const bcrypt = require('bcryptjs');

const getAllCustomers = async (req, res) => {
    try {
        const customers = await User.aggregate([
            {
                $match: {
                    role: 'customer',
                    isActive: true
                }
            },
            {
                $lookup: {
                    from: 'bookings',
                    localField: '_id',
                    foreignField: 'customerId',
                    as: 'bookings'
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    phone: 1,
                    createdAt: 1,
                    totalBookings: { $size: '$bookings' }
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);

        res.status(200).json({ success: true, count: customers.length, data: customers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching customers.' });
    }
};

const getCustomerById = async (req, res) => {
    try {
        const [customer, bookings] = await Promise.all([
            User.findById(req.params.id),
            Booking.find({ customerId: req.params.id }).sort({ createdAt: -1 })
        ]);

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found.' });
        }

        res.status(200).json({ success: true, data: { profile: customer, history: bookings } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching customer details.' });
    }
};

const createCustomer = async (req, res) => {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'User with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role: 'customer',
            isEmailVerified: true,
        });

        const userResponse = { ...newUser._doc };
        delete userResponse.password;

        res.status(201).json({ success: true, message: 'Customer created successfully.', data: userResponse });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while creating customer.' });
    }
};

const updateCustomer = async (req, res) => {
    const { name, email, phone, password } = req.body;
    let updates = { name, email, phone };

    try {
        if (password && password.length > 0) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(password, salt);
        }

        const updatedCustomer = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

        if (!updatedCustomer) {
            return res.status(404).json({ success: false, message: 'Customer not found.' });
        }

        const userResponse = { ...updatedCustomer._doc };
        delete userResponse.password;

        res.status(200).json({ success: true, message: 'Customer updated successfully.', data: userResponse });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'Email already in use.' });
        }
        res.status(500).json({ success: false, message: 'Server error while updating customer.' });
    }
};

const deleteCustomer = async (req, res) => {
    try {
        const customer = await User.findByIdAndUpdate(req.params.id, { isActive: false });

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found.' });
        }

        res.status(200).json({ success: true, message: 'Customer deactivated successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while deleting customer.' });
    }
};

module.exports = {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
};