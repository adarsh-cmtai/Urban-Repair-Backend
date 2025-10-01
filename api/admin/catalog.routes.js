const express = require('express');
const router = express.Router();
const {
    getUploadPresignedUrl,
    createCategory, getAllCategories, updateCategory, deleteCategory,
    createService, getAllServices, updateService, deleteService,
    createSubService, getAllSubServices, updateSubService, deleteSubService,
} = require('./catalog.controller');

router.post('/generate-upload-url', getUploadPresignedUrl);

router.post('/categories', createCategory);
router.get('/categories', getAllCategories);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

router.post('/services', createService);
router.get('/services', getAllServices);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);

router.post('/sub-services', createSubService);
router.get('/sub-services', getAllSubServices);
router.put('/sub-services/:id', updateSubService);
router.delete('/sub-services/:id', deleteSubService);

module.exports = router;