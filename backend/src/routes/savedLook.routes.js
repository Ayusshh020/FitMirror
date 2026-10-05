const express = require('express');
const router = express.Router();
const {
  createSavedLook,
  getSavedLooks,
  getSavedLookById,
  deleteSavedLook,
} = require('../controllers/savedLook.controller');
const { protect } = require('../middleware/auth.middleware');
const { createSavedLookValidator } = require('../validators/savedLook.validator');
const validate = require('../middleware/validate.middleware');

// GET by id or shareToken - no auth required if look is public
router.get('/:id', (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, getSavedLookById);

// All other routes require JWT
router.use(protect);

router.post('/', createSavedLookValidator, validate, createSavedLook);   // JSON body
router.get('/', getSavedLooks);
router.delete('/:id', deleteSavedLook);

module.exports = router;
