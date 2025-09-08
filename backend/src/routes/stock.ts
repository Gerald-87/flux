import express from 'express';
import { body } from 'express-validator';
import { 
  getStockMovements, 
  createStockMovement, 
  getStockTakes,
  createStockTake,
  updateStockTake,
  completeStockTake
} from '../controllers/stockController';
import { protect, authorize, vendorAccess } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/stock/movements
// @desc    Get stock movements for vendor
// @access  Private (Vendor)
router.get('/movements', authorize('vendor'), vendorAccess, getStockMovements);

// @route   POST /api/stock/movements
// @desc    Create stock movement (adjustment/transfer)
// @access  Private (Vendor)
router.post('/movements', authorize('vendor'), vendorAccess, [
  body('productId').notEmpty(),
  body('movementType').isIn(['adjustment', 'transfer']),
  body('quantity').isInt(),
  body('locationFrom').optional().trim(),
  body('locationTo').optional().trim(),
  body('notes').optional().trim(),
  validate
], createStockMovement);

// @route   GET /api/stock/takes
// @desc    Get stock takes for vendor
// @access  Private (Vendor)
router.get('/takes', authorize('vendor'), vendorAccess, getStockTakes);

// @route   POST /api/stock/takes
// @desc    Create new stock take
// @access  Private (Vendor)
router.post('/takes', authorize('vendor'), vendorAccess, [
  body('location').notEmpty().trim(),
  body('notes').optional().trim(),
  validate
], createStockTake);

// @route   PUT /api/stock/takes/:id
// @desc    Update stock take items
// @access  Private (Vendor)
router.put('/takes/:id', authorize('vendor'), [
  body('items').isArray({ min: 1 }),
  body('items.*.productId').notEmpty(),
  body('items.*.expectedQuantity').isInt({ min: 0 }),
  body('items.*.countedQuantity').isInt({ min: 0 }),
  validate
], updateStockTake);

// @route   PUT /api/stock/takes/:id/complete
// @desc    Complete stock take and apply adjustments
// @access  Private (Vendor)
router.put('/takes/:id/complete', authorize('vendor'), completeStockTake);

export default router;
