const express = require('express');
const router = express.Router();

const {
    createTechnician,
    getAllTechnicians,
    getTechnicianById,
    updateTechnician,
    deleteTechnician,
} = require('./technician.management.controller');

router.post('/', createTechnician);
router.get('/', getAllTechnicians);

router.get('/:id', getTechnicianById);
router.put('/:id', updateTechnician);
router.delete('/:id', deleteTechnician);

module.exports = router;