const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middlewares/auth.middleware');
const { isTechnician } = require('../../middlewares/role.middleware');

const profileRoutes = require('./profile.routes');
const jobRoutes = require('./job.routes');

router.use(verifyToken);
router.use(isTechnician);

router.use('/', profileRoutes);
router.use('/jobs', jobRoutes);

module.exports = router;