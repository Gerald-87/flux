import express from 'express';
import { body } from 'express-validator';
import { 
  getReports, 
  generateReport, 
  getReport,
  deleteReport
} from '../controllers/reportController';
import { protect, authorize, vendorAccess } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/reports
// @desc    Get all reports for vendor
// @access  Private (Vendor)
router.get('/', authorize('vendor'), vendorAccess, getReports);

// @route   GET /api/reports/:id
// @desc    Get single report
// @access  Private (Vendor)
router.get('/:id', authorize('vendor'), getReport);

// @route   POST /api/reports/generate
// @desc    Generate new report
// @access  Private (Vendor)
router.post('/generate', authorize('vendor'), vendorAccess, [
  body('type').isIn(['sales', 'inventory', 'customer', 'profit']),
  body('period').isIn(['daily', 'weekly', 'monthly', 'yearly', 'custom']),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  validate
], generateReport);

// @route   DELETE /api/reports/:id
// @desc    Delete report
// @access  Private (Vendor)
router.delete('/:id', authorize('vendor'), deleteReport);

export default router;
