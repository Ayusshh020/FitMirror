const { body } = require('express-validator');

const createGarmentValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('price')
    .isNumeric()
    .withMessage('Price must be a valid number')
    .custom((val) => val >= 0)
    .withMessage('Price must be greater than or equal to 0'),
  body('size').optional().isString(),
  body('purchaseUrl').optional().isString(),
];

const updateGarmentValidator = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a valid number')
    .custom((val) => val >= 0)
    .withMessage('Price must be greater than or equal to 0'),
  body('size').optional().isString(),
  body('purchaseUrl').optional().isString(),
];

module.exports = {
  createGarmentValidator,
  updateGarmentValidator,
};
