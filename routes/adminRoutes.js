const express = require('express');
const router = express.Router();
const { getStats, getAllDoctors, verifyDoctor, rejectDoctor, toggleDoctorBlock, togglePatientBlock } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes should be protected and restricted to 'admin' role
router.get('/stats', protect, authorize('admin'), getStats);
router.get('/doctors', protect, authorize('admin'), getAllDoctors);
router.patch('/verify-doctor/:id', protect, authorize('admin'), verifyDoctor);
router.patch('/reject-doctor/:id', protect, authorize('admin'), rejectDoctor);
router.patch('/doctor/toggle-block/:id', protect, authorize('admin'), toggleDoctorBlock);
router.patch('/patient/toggle-block/:id', protect, authorize('admin'), togglePatientBlock);
// Add these to your existing routes
// router.get('/patients', protect, authorize('admin'), getStats); // or create a new getAllPatients export
router.get('/patients-list', protect, authorize('admin'), require('../controllers/adminController').getAllPatients);
router.delete('/patient/:id', protect, authorize('admin'), require('../controllers/adminController').deletePatient);
module.exports = router;