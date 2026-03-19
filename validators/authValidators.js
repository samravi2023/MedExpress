const { body } = require('express-validator');
const { coordsArrayValidator } = require('./commonValidators');

const registerDoctorValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('specialization').trim().notEmpty().withMessage('Specialization is required')
];

const registerPatientValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  ...coordsArrayValidator('coords')
];

const registerAdminValidator = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidator = [
  body('email').trim().notEmpty().withMessage('Email or username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('role').isIn(['doctor', 'patient', 'admin']).withMessage('Role must be doctor, patient, or admin')
];

module.exports = {
  registerDoctorValidator,
  registerPatientValidator,
  registerAdminValidator,
  loginValidator
};
