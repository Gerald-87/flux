import express from 'express';
import { body } from 'express-validator';
import { 
  getSales, 
  getSale, 
  createSale, 
  refundSale,
  getSalesAnalytics,
  getReceiptData
} from '../controllers/saleController';
import { protect, authorize, vendorAccess, timeBasedAccess } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/sales
// @desc    Get all sales for vendor
// @access  Private (Vendor, Cashier)
router.get('/', authorize('vendor', 'cashier'), vendorAccess, getSales);

// @route   GET /api/sales/analytics
// @desc    Get sales analytics
// @access  Private (Vendor)
router.get('/analytics', authorize('vendor'), vendorAccess, getSalesAnalytics);

// @route   GET /api/sales/:id
// @desc    Get single sale
// @access  Private (Vendor, Cashier)
router.get('/:id', authorize('vendor', 'cashier'), getSale);

// @route   GET /api/sales/:id/receipt
// @desc    Get receipt data for sale
// @access  Private (Vendor, Cashier)
router.get('/:id/receipt', authorize('vendor', 'cashier'), getReceiptData);

// @route   POST /api/sales
// @desc    Create new sale
// @access  Private (Cashier)
router.post('/', authorize('cashier'), timeBasedAccess, vendorAccess, [
  body('items').isArray({ min: 1 }),
  body('items.*.productId').notEmpty(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('items.*.price').isFloat({ min: 0 }),
  body('subtotal').isFloat({ min: 0 }),
  body('total').isFloat({ min: 0 }),
  body('paid').isFloat({ min: 0 }),
  body('paymentMethod').isIn(['cash', 'card', 'mobile', 'loyalty']),
  body('terminalId').notEmpty(),
  body('customerId').optional(),
  validate
], createSale);

// @route   PUT /api/sales/:id/refund
// @desc    Process sale refund
// @access  Private (Vendor)
router.put('/:id/refund', authorize('vendor'), [
  body('refundAmount').isFloat({ min: 0 }),
  body('reason').optional().trim(),
  validate
], refundSale);

export default router;
