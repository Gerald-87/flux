import express from 'express';
import { body } from 'express-validator';
import { 
  getCustomers, 
  getCustomer, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer,
  getCustomerSales
} from '../controllers/customerController';
import { protect, authorize, vendorAccess } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/customers
// @desc    Get all customers for vendor
// @access  Private (Vendor, Cashier)
router.get('/', authorize('vendor', 'cashier'), vendorAccess, getCustomers);

// @route   GET /api/customers/:id
// @desc    Get single customer
// @access  Private (Vendor, Cashier)
router.get('/:id', authorize('vendor', 'cashier'), getCustomer);

// @route   GET /api/customers/:id/sales
// @desc    Get customer sales history
// @access  Private (Vendor, Cashier)
router.get('/:id/sales', authorize('vendor', 'cashier'), getCustomerSales);

// @route   POST /api/customers
// @desc    Create new customer
// @access  Private (Vendor, Cashier)
router.post('/', authorize('vendor', 'cashier'), vendorAccess, [
  body('name').notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('dateOfBirth').optional().isISO8601(),
  validate
], createCustomer);

// @route   PUT /api/customers/:id
// @desc    Update customer
// @access  Private (Vendor, Cashier)
router.put('/:id', authorize('vendor', 'cashier'), [
  body('name').optional().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('dateOfBirth').optional().isISO8601(),
  body('notes').optional().trim(),
  validate
], updateCustomer);

// @route   DELETE /api/customers/:id
// @desc    Delete customer
// @access  Private (Vendor)
router.delete('/:id', authorize('vendor'), deleteCustomer);

export default router;
