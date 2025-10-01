const express = require('express');
const router = express.Router();

const { getDashboardStats } = require('./dashboard.management.controller');

router.get('/', getDashboardStats);

module.exports = router;