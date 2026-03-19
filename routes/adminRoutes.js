const express = require('express');
const router = express.Router();
const { getStats, getAllDoctors, verifyDoctor, rejectDoctor } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes should be protected and restricted to 'admin' role
router.get('/stats', protect, authorize('admin'), getStats);
router.get('/doctors', protect, authorize('admin'), getAllDoctors);
router.patch('/verify-doctor/:id', protect, authorize('admin'), verifyDoctor);
router.patch('/reject-doctor/:id', protect, authorize('admin'), rejectDoctor);

module.exports = router;