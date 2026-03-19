const express = require('express');
const router = express.Router();
const { registerDoctor, login, registerAdmin, registerPatient } = require('../controllers/authController');
const {
	registerDoctorValidator,
	registerPatientValidator,
	registerAdminValidator,
	loginValidator
} = require('../validators/authValidators');
const { validateRequest } = require('../middleware/validationMiddleware');
const { doctorVerificationUpload } = require('../middleware/uploadMiddleware');

router.post(
	'/register/doctor',
	doctorVerificationUpload.fields([
		{ name: 'idProof', maxCount: 1 },
		{ name: 'certificate', maxCount: 1 }
	]),
	registerDoctorValidator,
	validateRequest,
	registerDoctor
);
router.post('/register/patient', registerPatientValidator, validateRequest, registerPatient);
router.post('/register/admin', registerAdminValidator, validateRequest, registerAdmin);
router.post('/login', loginValidator, validateRequest, login);

module.exports = router;