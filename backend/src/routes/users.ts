import express from 'express';
import { body } from 'express-validator';
import { 
  getUsers, 
  getUser, 
  createUser, 
  updateUser, 
  deleteUser,
  getCashiers,
  updateCashierSchedule 
} from '../controllers/userController';
import { protect, authorize, vendorAccess } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/users
// @desc    Get all users (vendor-specific)
// @access  Private (Vendor, Superadmin)
router.get('/', authorize('vendor', 'superadmin'), vendorAccess, getUsers);

// @route   GET /api/users/cashiers
// @desc    Get all cashiers for vendor
// @access  Private (Vendor)
router.get('/cashiers', authorize('vendor'), vendorAccess, getCashiers);

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private (Vendor, Superadmin)
router.get('/:id', authorize('vendor', 'superadmin'), getUser);

// @route   POST /api/users
// @desc    Create new user (cashier)
// @access  Private (Vendor)
router.post('/', authorize('vendor'), vendorAccess, [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['cashier']),
  body('terminalId').optional().trim(),
  body('assignedLocations').optional().isArray(),
  validate
], createUser);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Vendor, Superadmin)
router.put('/:id', authorize('vendor', 'superadmin'), [
  body('name').optional().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('isActive').optional().isBoolean(),
  body('terminalId').optional().trim(),
  body('assignedLocations').optional().isArray(),
  validate
], updateUser);

// @route   PUT /api/users/:id/schedule
// @desc    Update cashier work schedule
// @access  Private (Vendor)
router.put('/:id/schedule', authorize('vendor'), [
  body('checkInTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('checkOutTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('workDays').isArray().custom((value) => {
    return value.every((day: any) => Number.isInteger(day) && day >= 0 && day <= 6);
  }),
  body('timezone').optional().trim(),
  validate
], updateCashierSchedule);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Vendor, Superadmin)
router.delete('/:id', authorize('vendor', 'superadmin'), deleteUser);

export default router;
