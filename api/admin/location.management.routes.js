const express = require('express');
const router = express.Router();
const { createLocation, getAllLocations, updateLocation, deleteLocation } = require('./location.management.controller');

router.post('/', createLocation);
router.get('/', getAllLocations);
router.put('/:id', updateLocation);
router.delete('/:id', deleteLocation);

module.exports = router;