// File: src/api/customer/sell.request.routes.js

const express = require('express');
const router = express.Router();

const {
    createSellRequest,
    getCustomerSellRequests,
    getSellRequestDetailsForCustomer,
    respondToOffer
} = require('./sell.request.controller');

// POST /api/customer/sell-requests/new
router.post('/new', createSellRequest);

// GET /api/customer/sell-requests/
router.get('/', getCustomerSellRequests);

// GET /api/customer/sell-requests/:id
router.get('/:id', getSellRequestDetailsForCustomer);

// PATCH /api/customer/sell-requests/:id/respond
router.patch('/:id/respond', respondToOffer);

module.exports = router;