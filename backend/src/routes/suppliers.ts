import express from 'express';
import { body } from 'express-validator';
import { 
  getSuppliers, 
  getSupplier, 
  createSupplier, 
  updateSupplier, 
  deleteSupplier
} from '../controllers/supplierController';
import { protect, authorize, vendorAccess } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/suppliers
// @desc    Get all suppliers for vendor
// @access  Private (Vendor)
router.get('/', authorize('vendor'), vendorAccess, getSuppliers);

// @route   GET /api/suppliers/:id
// @desc    Get single supplier
// @access  Private (Vendor)
router.get('/:id', authorize('vendor'), getSupplier);

// @route   POST /api/suppliers
// @desc    Create new supplier
// @access  Private (Vendor)
router.post('/', authorize('vendor'), vendorAccess, [
  body('name').notEmpty().trim(),
  body('contactPerson').optional().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('paymentTerms').optional().trim(),
  validate
], createSupplier);

// @route   PUT /api/suppliers/:id
// @desc    Update supplier
// @access  Private (Vendor)
router.put('/:id', authorize('vendor'), [
  body('name').optional().trim(),
  body('contactPerson').optional().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('paymentTerms').optional().trim(),
  body('isActive').optional().isBoolean(),
  validate
], updateSupplier);

// @route   DELETE /api/suppliers/:id
// @desc    Delete supplier
// @access  Private (Vendor)
router.delete('/:id', authorize('vendor'), deleteSupplier);

export default router;
