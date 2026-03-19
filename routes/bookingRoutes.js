const express = require('express');
const router = express.Router();
const { createBooking, getDoctorBookings, updateBookingStatus, getBookingById, getPatientBookings } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const {
	createBookingValidator,
	updateBookingValidator,
	bookingIdParamValidator
} = require('../validators/bookingValidators');

router.post('/', protect, createBookingValidator, validateRequest, createBooking);
router.get('/doctor', protect, getDoctorBookings);
router.get('/patient', protect, getPatientBookings);
router.get('/:id', protect, bookingIdParamValidator, validateRequest, getBookingById);
router.patch('/:id', protect, updateBookingValidator, validateRequest, updateBookingStatus);

module.exports = router;