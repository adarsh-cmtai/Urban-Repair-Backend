const Testimonial = require('../../models/testimonial.model');
const { deleteFromS3 } = require('../../services/aws.s3.service');

const extractKeyFromUrl = (url) => {
  try {
    return url.split('/').pop();
  } catch {
    return null;
  }
};

const createTestimonial = async (req, res) => {
    try {
        const newTestimonial = await Testimonial.create(req.body);
        res.status(201).json({ success: true, data: newTestimonial });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getAllTestimonialsForAdmin = async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: testimonials });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateTestimonial = async (req, res) => {
    try {
        const updatedTestimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedTestimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });
        res.status(200).json({ success: true, data: updatedTestimonial });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial)
      return res.status(404).json({ success: false, message: 'Testimonial not found' });

    const imageKey = extractKeyFromUrl(testimonial.imageUrl);
    if (imageKey) {
      await deleteFromS3(imageKey);
    }

    await Testimonial.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Testimonial and image deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createTestimonial, getAllTestimonialsForAdmin, updateTestimonial, deleteTestimonial };