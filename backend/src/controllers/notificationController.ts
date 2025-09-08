import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// @desc    Get all notifications for vendor
// @route   GET /api/notifications
// @access  Private (Vendor, Cashier)
export const getNotifications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { vendorId } = req.body;
  const { isRead, type, page = 1, limit = 20 } = req.query;

  const where: any = { vendorId };

  // Filter by read status
  if (isRead !== undefined) {
    where.isRead = isRead === 'true';
  }

  // Filter by type
  if (type) {
    where.type = type.toString().toUpperCase();
  }

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
  });

  const total = await prisma.notification.count({ where });
  const unreadCount = await prisma.notification.count({
    where: { vendorId, isRead: false }
  });

  res.status(200).json({
    success: true,
    data: notifications.map(notification => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      link: notification.link,
      createdAt: notification.createdAt
    })),
    meta: {
      unreadCount,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private (Vendor, Cashier)
export const markAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const notification = await prisma.notification.findUnique({
    where: { id }
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  // Check vendor access
  if (notification.vendorId !== req.user?.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this notification'
    });
  }

  const updatedNotification = await prisma.notification.update({
    where: { id },
    data: { isRead: true }
  });

  return res.status(200).json({
    success: true,
    data: {
      id: updatedNotification.id,
      isRead: updatedNotification.isRead
    }
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private (Vendor, Cashier)
export const markAllAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { vendorId } = req.body;

  const result = await prisma.notification.updateMany({
    where: {
      vendorId,
      isRead: false
    },
    data: { isRead: true }
  });

  return res.status(200).json({
    success: true,
    message: `Marked ${result.count} notifications as read`
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private (Vendor, Cashier)
export const deleteNotification = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const notification = await prisma.notification.findUnique({
    where: { id }
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  // Check vendor access
  if (notification.vendorId !== req.user?.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this notification'
    });
  }

  await prisma.notification.delete({
    where: { id }
  });

  return res.status(200).json({
    success: true,
    message: 'Notification deleted successfully'
  });
});
