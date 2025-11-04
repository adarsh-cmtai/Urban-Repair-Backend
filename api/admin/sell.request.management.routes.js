const express = require('express');
const router = express.Router();

const {
    getAllSellRequests,
    getSellRequestById,
    assignTechnicianForInspection,
    assignTechnicianForPickup,
    updateSellRequestStatus,
    makeFinalOffer,
    generateSuggestedPrice 
} = require('./sell.request.management.controller');

router.get('/', getAllSellRequests);
router.get('/:id', getSellRequestById);
router.patch('/:id/assign-inspection', assignTechnicianForInspection);
router.patch('/:id/assign-pickup', assignTechnicianForPickup);
router.patch('/:id/status', updateSellRequestStatus);
router.patch('/:id/make-offer', makeFinalOffer);
router.post('/:id/generate-price', generateSuggestedPrice); 

module.exports = router;