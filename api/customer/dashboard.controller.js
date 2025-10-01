// src/api/customer/dashboard.controller.js
const Booking = require('../../models/booking.model');
const User = require('../../models/user.model');

const getDashboardOverview = async (req, res) => {
    try {
        const userId = req.user.id;

        // We use Promise.all to run all database queries concurrently for better performance
        const [user, upcomingService, recentActivity] = await Promise.all([
            // 1. Get user's name
            User.findById(userId).select('name'),

            // 2. Find the very next upcoming service
            Booking.findOne({
                customerId: userId,
                status: { $in: ['Pending', 'Confirmed', 'Assigned', 'InProgress', 'Rescheduled'] }
            }).sort({ preferredDate: 1 }), // Sort by date ascending to get the soonest

            // 3. Find the most recently completed service
            Booking.findOne({
                customerId: userId,
                status: 'Completed'
            }).sort({ updatedAt: -1 }) // Sort by last updated descending to get the most recent
        ]);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const dashboardData = {
            welcomeMessage: `Hello, ${user.name}!`,
            upcomingService: upcomingService || null, // Send null if no upcoming service is found
            recentActivity: recentActivity || null   // Send null if no recent activity is found
        };

        res.status(200).json({ success: true, data: dashboardData });

    } catch (error) {
        console.error("Dashboard overview error:", error);
        res.status(500).json({ success: false, message: 'Server error while fetching dashboard data.' });
    }
};

module.exports = {
    getDashboardOverview,
};