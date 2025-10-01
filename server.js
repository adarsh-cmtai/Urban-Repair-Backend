require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./api/auth/auth.routes');
const customerRoutes = require('./api/customer/customer.routes'); 
const adminRoutes = require('./api/admin/admin.routes'); 
const technicianRoutes = require('./api/technician/technician.routes')
const Blog = require('./models/blog.model');
const publicRoutes = require('./api/public.routes');


const app = express();


app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

connectDB();

app.get('/', (req, res) => {
    res.send('Home Appliance Service API is running!');
});

app.use('/api/public', publicRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/technician',technicianRoutes)

app.get('/api/public/blogs', async (req, res) => {
    try {
        const blogs = await Blog.find({ isPublished: true }).sort({ publishedAt: -1 });
        res.status(200).json({ success: true, data: blogs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

app.get('/api/public/blogs/:slug', async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true });
        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
        res.status(200).json({ success: true, data: blog });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// (Optional but Recommended) Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


// 6. Start the Server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});