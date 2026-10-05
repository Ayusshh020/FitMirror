const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateToken = (id) => {
  return jwt.sign({ id }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
};

// @desc    Register new user or retailer
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(400, 'User already exists with this email');
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: 'user',
  });

  const token = generateToken(user._id);

  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    photoUrl: user.photoUrl,
    createdAt: user.createdAt,
  };

  new ApiResponse(201, { user: userData, token }, 'Registration successful').send(res);
});

// @desc    Login user or retailer
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user._id);

  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    photoUrl: user.photoUrl,
    createdAt: user.createdAt,
  };

  new ApiResponse(200, { user: userData, token }, 'Login successful').send(res);
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  new ApiResponse(200, { user }, 'User profile fetched').send(res);
});

// @desc    Authenticate with Firebase ID Token -> return FitMirror JWT
// @route   POST /api/auth/firebase
// @access  Public
const firebaseAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new ApiError(400, 'idToken is required');
  }

  const { verifyFirebaseIdToken, isConfigured: isFirebaseConfigured } = require('../config/firebase');

  if (!isFirebaseConfigured) {
    throw new ApiError(503, 'Firebase Auth is not configured on the server');
  }

  let decodedToken;
  try {
    decodedToken = await verifyFirebaseIdToken(idToken);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired Firebase ID token: ' + err.message);
  }

  const { email, name } = decodedToken;
  if (!email) {
    throw new ApiError(400, 'Firebase user account does not have an email');
  }

  let user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    user = await User.create({
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      password: Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
      role: 'user', // Always force 'user'
    });
  }

  const token = generateToken(user._id);

  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    photoUrl: user.photoUrl,
    createdAt: user.createdAt,
  };

  new ApiResponse(200, { user: userData, token }, 'Firebase authentication successful').send(res);
});

module.exports = {
  register,
  login,
  getMe,
  firebaseAuth,
};
