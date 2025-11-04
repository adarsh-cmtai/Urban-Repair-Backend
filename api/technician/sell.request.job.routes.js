// File: src/api/technician/sell.request.job.routes.js

const express = require('express');
const router = express.Router();

const {
    getInspectionJobs,
    submitInspectionReport,
    confirmPickupAndPayment // Import the new function
} = require('./sell.request.job.controller');

router.get('/', getInspectionJobs);
router.patch('/:id/inspect', submitInspectionReport);
router.patch('/:id/confirm-pickup', confirmPickupAndPayment); // Add the new route

module.exports = router;