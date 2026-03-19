const { body, param } = require('express-validator');
const { coordsArrayValidator } = require('./commonValidators');

const createBookingValidator = [
  body('patientId').optional().isString().withMessage('patientId must be a string'),
  body('doctorId').trim().notEmpty().withMessage('doctorId is required'),
  body('patientName').optional().isString().withMessage('patientName must be a string'),
  body('doctorName').optional().isString().withMessage('doctorName must be a string'),
  body('amount').isFloat({ min: 0 }).withMessage('amount must be a non-negative number'),
  ...coordsArrayValidator('patientCoords')
];

const updateBookingValidator = [
  param('id').isMongoId().withMessage('Invalid booking id'),
  body('status')
    .optional()
    .isIn(['pending', 'accepted', 'rejected', 'completed', 'cancelled'])
    .withMessage('Invalid booking status'),
  body('medicalNotes')
    .optional()
    .isString()
    .withMessage('medicalNotes must be a string'),
  body('medicalChecklist')
    .optional()
    .isArray()
    .withMessage('medicalChecklist must be an array')
];

const bookingIdParamValidator = [
  param('id').isMongoId().withMessage('Invalid booking id')
];

module.exports = {
  createBookingValidator,
  updateBookingValidator,
  bookingIdParamValidator
};
