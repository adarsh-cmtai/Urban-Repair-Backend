// File: src/api/admin/buyback.management.routes.js
const express = require('express');
const router = express.Router();
const {
    getAllBuybackServices,
    createBuybackService,
    getBuybackServiceById,
    updateBuybackService,
    deleteBuybackService
} = require('./buyback.management.controller');

router.get('/', getAllBuybackServices);
router.post('/', createBuybackService);
router.get('/:id', getBuybackServiceById);
router.put('/:id', updateBuybackService);
router.delete('/:id', deleteBuybackService);

module.exports = router;