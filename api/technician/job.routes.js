const express = require('express');
const router = express.Router();

const {
    getTodaysJobs,
    getJobHistory,
    getJobDetails,
    startJob,
    updateJobDetails,
    completeJob,
    generateJobUploadUrl,
} = require('./job.controller');

router.get('/today', getTodaysJobs);
router.get('/history', getJobHistory);

router.get('/:id', getJobDetails);
router.patch('/:id/start', startJob);
router.patch('/:id/update', updateJobDetails);
router.post('/:id/complete', completeJob);
router.post('/generate-upload-url', generateJobUploadUrl);

module.exports = router;