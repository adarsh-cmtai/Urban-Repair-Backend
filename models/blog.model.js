const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    imageUrl: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    readTime: { type: String, required: true },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
}, { timestamps: true });

blogSchema.pre('save', function(next) {
    if (this.isModified('title')) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
    if (this.isModified('isPublished') && this.isPublished) {
        this.publishedAt = new Date();
    }
    next();
});

module.exports = mongoose.model('Blog', blogSchema);