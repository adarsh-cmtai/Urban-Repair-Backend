const Booking = require('../../models/booking.model');
const { generateUploadUrl } = require('../../services/aws.s3.service');

const generateJobUploadUrl = async (req, res) => {
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

const getTodaysJobs = async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const todaysJobs = await Booking.find({
            technicianId: req.user.id,
            preferredDate: {
                $gte: todayStart,
                $lte: todayEnd
            }
        })
        .select('timeSlot serviceType address customerId status preferredDate')
        .populate('customerId', 'name')
        .sort({ preferredDate: 1, 'timeSlot': 1 });

        const totalJobsToday = todaysJobs.length;
        const nextJob = todaysJobs.find(job => job.status !== 'Completed') || null;

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalJobsToday,
                    nextJob,
                },
                jobQueue: todaysJobs,
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching today\'s jobs.' });
    }
};

const getJobHistory = async (req, res) => {
    const { dateFrom, dateTo } = req.query;
    let query = { 
        technicianId: req.user.id,
        status: 'Completed'
    };
    if (dateFrom && dateTo) {
        query.preferredDate = { $gte: new Date(dateFrom), $lte: new Date(dateTo) };
    }
    try {
        const jobs = await Booking.find(query)
            .populate('customerId', 'name')
            .select('serviceType preferredDate status serviceCharge customerId')
            .sort({ preferredDate: -1 });
        res.status(200).json({ success: true, count: jobs.length, data: jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching job history.' });
    }
};

const getJobDetails = async (req, res) => {
    try {
        const job = await Booking.findOne({ _id: req.params.id, technicianId: req.user.id })
            .populate('customerId', 'name phone');
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found or not assigned to you.' });
        }
        res.status(200).json({ success: true, data: job });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching job details.' });
    }
};

const startJob = async (req, res) => {
    try {
        const job = await Booking.findOneAndUpdate({ _id: req.params.id, technicianId: req.user.id }, { status: 'InProgress' }, { new: true });
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found or not assigned to you.' });
        }
        res.status(200).json({ success: true, message: 'Job started successfully.', data: job });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while starting job.' });
    }
};

const updateJobDetails = async (req, res) => {
    const { technicianNotes, serviceCharge, beforeServiceImage, afterServiceImage } = req.body;
    let updates = {};
    if (technicianNotes) updates.technicianNotes = technicianNotes;
    if (serviceCharge) updates.serviceCharge = serviceCharge;
    if (beforeServiceImage) updates.beforeServiceImage = beforeServiceImage;
    if (afterServiceImage) updates.afterServiceImage = afterServiceImage;
    try {
        const job = await Booking.findOneAndUpdate({ _id: req.params.id, technicianId: req.user.id }, { $set: updates }, { new: true });
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found or not assigned to you.' });
        }
        res.status(200).json({ success: true, message: 'Job details updated.', data: job });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while updating job details.' });
    }
};

const completeJob = async (req, res) => {
    const { otp } = req.body;
    if (!otp) {
        return res.status(400).json({ success: false, message: 'OTP is required to complete the job.' });
    }
    try {
        const job = await Booking.findOne({ _id: req.params.id, technicianId: req.user.id }).select('+completionOTP');
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found or not assigned to you.' });
        }
        if (job.status === 'Completed') {
            return res.status(400).json({ success: false, message: 'This job has already been completed.' });
        }
        if (job.completionOTP !== otp) {
            return res.status(401).json({ success: false, message: 'Invalid OTP. Please ask the customer for the correct OTP.' });
        }
        job.status = 'Completed';
        job.completionOTP = undefined;
        await job.save();
        res.status(200).json({ success: true, message: 'Job completed successfully!', data: job });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while completing job.' });
    }
};

module.exports = {
    generateJobUploadUrl,
    getTodaysJobs,
    getJobHistory,
    getJobDetails,
    startJob,
    updateJobDetails,
    completeJob,
};