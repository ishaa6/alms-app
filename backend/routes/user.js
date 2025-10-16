const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');

// Get user profile
router.get('/profile', authenticate, getUserProfile);

// Update user profile
router.put('/profile', authenticate, updateUserProfile);

module.exports = router;
