const express = require('express');
const router = express.Router();
const { toggleAvailability, updateLocation } = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');
const { updateLocationValidator } = require('../validators/doctorValidators');
const { validateRequest } = require('../middleware/validationMiddleware');

router.put('/availability', protect, toggleAvailability);
router.put('/location', protect, updateLocationValidator, validateRequest, updateLocation);

module.exports = router;