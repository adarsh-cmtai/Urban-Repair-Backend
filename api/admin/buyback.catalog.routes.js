const express = require('express');
const router = express.Router();

const {
    // Category Functions
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
    // Capacity Functions
    createCapacity,
    getCapacitiesByCategory,
    updateCapacity,
    deleteCapacity,
    // Brand Functions
    createBrand,
    getBrandsByCapacity,
    updateBrand,
    deleteBrand
} = require('./buyback.catalog.controller');

// Category Routes
router.route('/categories')
    .post(createCategory)
    .get(getAllCategories);

router.route('/categories/:id')
    .put(updateCategory)
    .delete(deleteCategory);

// Capacity Routes
router.route('/capacities')
    .post(createCapacity)
    .get(getCapacitiesByCategory);

router.route('/capacities/:id')
    .put(updateCapacity)
    .delete(deleteCapacity);

// Brand Routes
router.route('/brands')
    .post(createBrand)
    .get(getBrandsByCapacity);

router.route('/brands/:id')
    .put(updateBrand)
    .delete(deleteBrand);

module.exports = router;