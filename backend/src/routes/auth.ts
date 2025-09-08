import express from 'express';
import { body } from 'express-validator';
import { login, register, getMe, updateProfile } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  validate
], login);

// @route   POST /api/auth/register
// @desc    Register new user (vendor)
// @access  Public
router.post('/register', [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('businessType').optional().trim(),
  body('phone').optional().trim(),
  validate
], register);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, getMe);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, [
  body('name').optional().trim(),
  body('phone').optional().trim(),
  body('avatar').optional().isURL(),
  validate
], updateProfile);

export default router;
