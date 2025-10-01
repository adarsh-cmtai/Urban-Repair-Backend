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

router.use(verifyToken);
router.use(isAdmin);

router.use('/dashboard', dashboardManagementRoutes);
router.use('/catalog', catalogRoutes);
router.use('/customers', customerManagementRoutes);
router.use('/technicians', technicianManagementRoutes);
router.use('/bookings', bookingManagementRoutes);
router.use('/blogs', blogManagementRoutes);

module.exports = router;