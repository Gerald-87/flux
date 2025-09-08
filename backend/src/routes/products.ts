import express from 'express';
import { body } from 'express-validator';
import { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getLowStockProducts,
  getProductsByLocation,
  updateProductStock
} from '../controllers/productController';
import { protect, authorize, vendorAccess } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/products
// @desc    Get all products for vendor
// @access  Private (Vendor, Cashier)
router.get('/', authorize('vendor', 'cashier'), vendorAccess, getProducts);

// @route   GET /api/products/low-stock
// @desc    Get low stock products
// @access  Private (Vendor)
router.get('/low-stock', authorize('vendor'), vendorAccess, getLowStockProducts);

// @route   GET /api/products/location/:location
// @desc    Get products by location
// @access  Private (Vendor, Cashier)
router.get('/location/:location', authorize('vendor', 'cashier'), vendorAccess, getProductsByLocation);

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Private (Vendor, Cashier)
router.get('/:id', authorize('vendor', 'cashier'), getProduct);

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Vendor)
router.post('/', authorize('vendor'), vendorAccess, [
  body('name').notEmpty().trim(),
  body('sku').notEmpty().trim(),
  body('price').isFloat({ min: 0 }),
  body('costPrice').isFloat({ min: 0 }),
  body('category').optional().trim(),
  body('brand').optional().trim(),
  body('description').optional().trim(),
  body('barcode').optional().trim(),
  body('unit').optional().trim(),
  body('minStock').optional().isInt({ min: 0 }),
  body('maxStock').optional().isInt({ min: 1 }),
  body('trackExpiry').optional().isBoolean(),
  body('trackSerial').optional().isBoolean(),
  validate
], createProduct);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Vendor)
router.put('/:id', authorize('vendor'), [
  body('name').optional().trim(),
  body('price').optional().isFloat({ min: 0 }),
  body('costPrice').optional().isFloat({ min: 0 }),
  body('category').optional().trim(),
  body('brand').optional().trim(),
  body('description').optional().trim(),
  body('barcode').optional().trim(),
  body('unit').optional().trim(),
  body('minStock').optional().isInt({ min: 0 }),
  body('maxStock').optional().isInt({ min: 1 }),
  body('isActive').optional().isBoolean(),
  body('trackExpiry').optional().isBoolean(),
  body('trackSerial').optional().isBoolean(),
  validate
], updateProduct);

// @route   PUT /api/products/:id/stock
// @desc    Update product stock
// @access  Private (Vendor)
router.put('/:id/stock', authorize('vendor'), [
  body('location').notEmpty().trim(),
  body('quantity').isInt({ min: 0 }),
  body('operation').isIn(['set', 'add', 'subtract']),
  validate
], updateProductStock);

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Vendor)
router.delete('/:id', authorize('vendor'), deleteProduct);

export default router;
