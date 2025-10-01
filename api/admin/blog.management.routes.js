const express = require('express');
const router = express.Router();
const { createBlog, getAllBlogsForAdmin, getBlogById, updateBlog, deleteBlog } = require('./blog.management.controller');

router.post('/', createBlog);
router.get('/', getAllBlogsForAdmin);
router.get('/:id', getBlogById);
router.put('/:id', updateBlog);
router.delete('/:id', deleteBlog);

module.exports = router;