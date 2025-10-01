const Booking = require('../../models/booking.model');

const getDashboardStats = async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const [kpiStats, latestPendingBookings, ongoingJobs, weeklyBookingsData] = await Promise.all([
            Booking.aggregate([
                {
                    $facet: {
                        newBookingsToday: [
                            { $match: { createdAt: { $gte: todayStart, $lte: todayEnd } } },
                            { $count: 'count' }
                        ],
                        pendingAssignments: [
                            { $match: { status: 'Pending' } },
                            { $count: 'count' }
                        ],
                        jobsInProgress: [
                            { $match: { status: 'InProgress' } },
                            { $count: 'count' }
                        ],
                        completedToday: [
                            { $match: { status: 'Completed', updatedAt: { $gte: todayStart, $lte: todayEnd } } },
                            { $count: 'count' }
                        ],
                        totalEarningsToday: [
                            { $match: { status: 'Completed', updatedAt: { $gte: todayStart, $lte: todayEnd } } },
                            { $group: { _id: null, total: { $sum: '$serviceCharge' } } }
                        ]
                    }
                }
            ]),
            Booking.find({ status: 'Pending' })
                .sort({ createdAt: -1 })
                .limit(7)
                .populate('customerId', 'name'),
            Booking.find({ status: 'InProgress' })
                .sort({ createdAt: 1 })
                .populate('customerId', 'name')
                .populate('technicianId', 'name'),
            Booking.aggregate([
                { $match: { createdAt: { $gte: sevenDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        const stats = {
            newBookingsToday: kpiStats[0].newBookingsToday[0]?.count || 0,
            pendingAssignments: kpiStats[0].pendingAssignments[0]?.count || 0,
            jobsInProgress: kpiStats[0].jobsInProgress[0]?.count || 0,
            completedToday: kpiStats[0].completedToday[0]?.count || 0,
            totalEarningsToday: kpiStats[0].totalEarningsToday[0]?.total || 0,
        };

        res.status(200).json({
            success: true,
            data: {
                stats,
                latestPendingBookings,
                ongoingJobs,
                weeklyBookingsData
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching dashboard stats.' });
    }
};

module.exports = {
    getDashboardStats,
};