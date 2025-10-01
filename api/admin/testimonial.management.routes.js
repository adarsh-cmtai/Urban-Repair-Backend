const express = require('express');
const router = express.Router();
const { createTestimonial, getAllTestimonialsForAdmin, updateTestimonial, deleteTestimonial } = require('./testimonial.management.controller');

router.post('/', createTestimonial);
router.get('/', getAllTestimonialsForAdmin);
router.put('/:id', updateTestimonial);
router.delete('/:id', deleteTestimonial);

module.exports = router;