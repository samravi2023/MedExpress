const express = require('express');
const router = express.Router();
const { getNearbyDoctors, updateProfile } = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');

router.get('/nearby', protect, getNearbyDoctors);
router.put('/profile', protect, updateProfile);

module.exports = router;