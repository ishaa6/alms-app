const express = require('express');
const router = express.Router();
const { login, 
        signup, 
        getMe,
        checkEmailExists,
        sendVerificationCode,
        verifyCode,
        setNewPassword, 
} = require('../controllers/authController');
const authenticate = require('../middleware/auth');

router.post('/login', login);
router.post('/signup', signup);
router.get('/me', authenticate, getMe);
router.post('/check-email', checkEmailExists);
router.post('/send-verification-code', sendVerificationCode);
router.post('/verify-code', verifyCode);
router.post('/set-password', setNewPassword);

module.exports = router;

