const express = require('express');
const router = express.Router();
const { register, login, getMe, firebaseAuth } = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../validators/auth.validator');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.post('/firebase', firebaseAuth);
router.get('/me', protect, getMe);

module.exports = router;
