const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middlewares/auth.middleware');
const { isAdmin } = require('../../middlewares/role.middleware');

const catalogRoutes = require('./catalog.routes');
const customerManagementRoutes = require('./customer.management.routes');
const technicianManagementRoutes = require('./technician.management.routes');
const bookingManagementRoutes = require('./booking.management.routes');
const dashboardManagementRoutes = require('./dashboard.management.routes');
const blogManagementRoutes = require('./blog.management.routes');
const testimonialRoutes = require('./testimonial.management.routes');
const locationRoutes = require('./location.management.routes');
const sellRequestManagementRoutes = require('./sell.request.management.routes');
const buybackManagementRoutes = require('./buyback.management.routes');
const buybackCatalogRoutes = require('./buyback.catalog.routes');

router.use(verifyToken);
router.use(isAdmin);

router.use('/dashboard', dashboardManagementRoutes);
router.use('/catalog', catalogRoutes);
router.use('/customers', customerManagementRoutes);
router.use('/technicians', technicianManagementRoutes);
router.use('/bookings', bookingManagementRoutes);
router.use('/blogs', blogManagementRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/locations', locationRoutes);
router.use('/sell-requests', sellRequestManagementRoutes);
router.use('/buyback-services', buybackManagementRoutes);
router.use('/buyback-catalog', buybackCatalogRoutes); 

module.exports = router;