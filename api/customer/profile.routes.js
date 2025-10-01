const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    updateUserProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    changePassword,
} = require('./profile.controller');

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

router.post('/profile/addresses', addAddress);
router.put('/profile/addresses/:addressId', updateAddress);
router.delete('/profile/addresses/:addressId', deleteAddress);

router.post('/profile/change-password', changePassword);

module.exports = router;