const express = require('express');
const router = express.Router();
const { createPrescription, getPrescriptionByBooking } = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('doctor'), createPrescription);
router.get('/booking/:bookingId', protect, getPrescriptionByBooking);

module.exports = router;
