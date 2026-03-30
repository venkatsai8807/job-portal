const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe, verifyOTP, resendOTP } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .isIn(['seeker', 'recruiter'])
      .withMessage('Role must be seeker or recruiter'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.get('/me', protect, getMe);

router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

module.exports = router;
