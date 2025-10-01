const express = require('express');
const router = express.Router();

const {
    getTechnicianProfile,
    updateTechnicianProfile,
    changePassword,
} = require('./profile.controller');

router.get('/profile', getTechnicianProfile);
router.put('/profile', updateTechnicianProfile);
router.post('/profile/change-password', changePassword);

module.exports = router;