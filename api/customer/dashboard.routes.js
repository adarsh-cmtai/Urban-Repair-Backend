// src/api/customer/dashboard.routes.js
const express = require('express');
const router = express.Router();

const { getDashboardOverview } = require('./dashboard.controller');

// This will handle the GET /api/customer/dashboard endpoint
router.get('/', getDashboardOverview);

module.exports = router;