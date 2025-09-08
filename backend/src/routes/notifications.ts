import express from 'express';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead,
  deleteNotification
} from '../controllers/notificationController';
import { protect, authorize, vendorAccess } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/notifications
// @desc    Get all notifications for vendor
// @access  Private (Vendor, Cashier)
router.get('/', authorize('vendor', 'cashier'), vendorAccess, getNotifications);

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private (Vendor, Cashier)
router.put('/:id/read', authorize('vendor', 'cashier'), markAsRead);

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private (Vendor, Cashier)
router.put('/read-all', authorize('vendor', 'cashier'), vendorAccess, markAllAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private (Vendor, Cashier)
router.delete('/:id', authorize('vendor', 'cashier'), deleteNotification);

export default router;
