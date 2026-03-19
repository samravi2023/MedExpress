const { body } = require('express-validator');

const updateLocationValidator = [
  body('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('lng must be between -180 and 180'),
  body('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('lat must be between -90 and 90')
];

module.exports = {
  updateLocationValidator
};
