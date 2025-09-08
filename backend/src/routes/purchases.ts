import express from 'express';
import { body } from 'express-validator';
import { 
  getPurchases, 
  getPurchase, 
  createPurchase, 
  updatePurchase, 
  deletePurchase,
  completePurchase
} from '../controllers/purchaseController';
import { protect, authorize, vendorAccess } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/purchases
// @desc    Get all purchases for vendor
// @access  Private (Vendor)
router.get('/', authorize('vendor'), vendorAccess, getPurchases);

// @route   GET /api/purchases/:id
// @desc    Get single purchase
// @access  Private (Vendor)
router.get('/:id', authorize('vendor'), getPurchase);

// @route   POST /api/purchases
// @desc    Create new purchase order
// @access  Private (Vendor)
router.post('/', authorize('vendor'), vendorAccess, [
  body('supplierId').notEmpty(),
  body('items').isArray({ min: 1 }),
  body('items.*.productId').notEmpty(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('items.*.costPrice').isFloat({ min: 0 }),
  body('subtotal').isFloat({ min: 0 }),
  body('total').isFloat({ min: 0 }),
  body('deliveryDate').optional().isISO8601(),
  validate
], createPurchase);

// @route   PUT /api/purchases/:id
// @desc    Update purchase order
// @access  Private (Vendor)
router.put('/:id', authorize('vendor'), [
  body('supplierId').optional(),
  body('deliveryDate').optional().isISO8601(),
  body('notes').optional().trim(),
  body('status').optional().isIn(['pending', 'completed', 'cancelled']),
  validate
], updatePurchase);

// @route   PUT /api/purchases/:id/complete
// @desc    Complete purchase order and update inventory
// @access  Private (Vendor)
router.put('/:id/complete', authorize('vendor'), completePurchase);

// @route   DELETE /api/purchases/:id
// @desc    Delete purchase order
// @access  Private (Vendor)
router.delete('/:id', authorize('vendor'), deletePurchase);

export default router;
