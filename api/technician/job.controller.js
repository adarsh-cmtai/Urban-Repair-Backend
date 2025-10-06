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

const getTechnicianJobs = async (req, res) => {
    try {
        const technicianId = req.user.id;
        const jobs = await Booking.find({
            $or: [
                { offeredTo: technicianId, status: 'Offered' },
                { technicianId: technicianId, status: { $in: ['Accepted', 'InProgress', 'Rescheduled'] } }
            ]
        })
        .populate('customerId', 'name')
        .sort({ preferredDate: 1, 'timeSlot': 1 });

        res.status(200).json({ success: true, data: { jobQueue: jobs } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching jobs.' });
    }
};

const acceptJob = async (req, res) => {
    const { id: bookingId } = req.params;
    const technicianId = req.user.id;

    try {
        const updatedBooking = await Booking.findOneAndUpdate(
            { _id: bookingId, status: 'Offered' },
            { 
                $set: { 
                    status: 'Accepted', 
                    technicianId: technicianId,
                    offeredTo: []
                }
            },
            { new: true }
        );

        if (!updatedBooking) {
            return res.status(409).json({ success: false, message: 'Sorry, this job has already been accepted by another technician.' });
        }

        res.status(200).json({ success: true, message: 'Job accepted successfully!', data: updatedBooking });
    } catch (error) {
        console.error("ACCEPT JOB ERROR:", error);
        res.status(500).json({ success: false, message: 'Server error while accepting job.' });
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
    getTechnicianJobs,
    acceptJob,
    getJobHistory,
    getJobDetails,
    startJob,
    updateJobDetails,
    completeJob,
};