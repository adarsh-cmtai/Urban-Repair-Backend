const express = require('express');
const router = express.Router();

const {
    getTechnicianJobs,
    getJobHistory,
    getJobDetails,
    startJob,
    updateJobDetails,
    completeJob,
    acceptJob,
    generateJobUploadUrl,
} = require('./job.controller');

router.get('/queue', getTechnicianJobs);
router.patch('/:id/accept', acceptJob);
router.get('/history', getJobHistory);

router.get('/:id', getJobDetails);
router.patch('/:id/start', startJob);
router.patch('/:id/update', updateJobDetails);
router.post('/:id/complete', completeJob);
router.post('/generate-upload-url', generateJobUploadUrl);

module.exports = router;