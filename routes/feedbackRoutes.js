const express = require('express');
const router = express.Router();
const { submitFeedback, getFeedbacks, submitBookingFeedback } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, submitFeedback);
router.post('/booking', protect, authorize('patient'), submitBookingFeedback);
router.get('/', protect, authorize('admin'), getFeedbacks); // Only admin can view all

module.exports = router;