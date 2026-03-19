const { body } = require('express-validator');

const coordsArrayValidator = (fieldName = 'coords') => [
  body(fieldName)
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array: [lng, lat]'),
  body(`${fieldName}.*`)
    .optional()
    .isFloat()
    .withMessage('Coordinates must be numeric values'),
  body(fieldName)
    .optional()
    .custom((coords) => {
      if (!Array.isArray(coords) || coords.length !== 2) {
        return true;
      }

      const [lng, lat] = coords.map(Number);
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
        throw new Error('Coordinates must contain finite numbers');
      }

      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        throw new Error('Coordinates out of range. Expected [lng, lat]');
      }

      return true;
    })
];

module.exports = {
  coordsArrayValidator
};
