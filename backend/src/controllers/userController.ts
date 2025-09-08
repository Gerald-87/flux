import { Request, Response } from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Hash password with MD5
const hashPassword = (password: string): string => {
  return crypto.createHash('md5').update(password).digest('hex');
};

// @desc    Get all users for vendor
// @route   GET /api/users
// @access  Private (Vendor, Superadmin)
export const getUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { vendorId } = req.body;
  const { role, search, page = 1, limit = 10 } = req.query;

  const where: any = {};
  
  // Filter by vendor if not superadmin
  if (req.user?.role !== 'superadmin') {
    where.vendorId = vendorId;
  }

  // Filter by role
  if (role) {
    where.role = role;
  }

  // Search functionality
  if (search) {
    where.OR = [
      { name: { contains: search as string } },
      { email: { contains: search as string } }
    ];
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      vendor: {
        select: { name: true }
      },
      cashierSchedule: true,
    },
    orderBy: { createdAt: 'desc' },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
  });

  const total = await prisma.user.count({ where });

  res.status(200).json({
    success: true,
    data: users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      vendorId: user.vendorId,
      vendorName: user.vendor?.name,
      isActive: user.isActive,
      terminalId: user.terminalId,
      assignedLocations: user.assignedLocations,
      lastLogin: user.lastLogin,
      workSchedule: user.cashierSchedule ? {
        checkInTime: user.cashierSchedule.checkInTime,
        checkOutTime: user.cashierSchedule.checkOutTime,
        workDays: user.cashierSchedule.workDays,
        timezone: user.cashierSchedule.timezone,
        isActive: user.cashierSchedule.isActive
      } : null,
      createdAt: user.createdAt
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// @desc    Get cashiers for vendor
// @route   GET /api/users/cashiers
// @access  Private (Vendor)
export const getCashiers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { vendorId } = req.body;

  const users = await prisma.user.findMany({
    where: { vendorId: req.user!.vendorId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      lastLogin: true,
      terminalId: true,
      assignedLocations: true,
    },
    orderBy: { createdAt: 'desc' }
  }).then((users: any) => users.map((user: any) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    terminalId: user.terminalId,
    assignedLocations: user.assignedLocations,
  })));

  res.status(200).json({
    success: true,
    data: users
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Vendor, Superadmin)
export const getUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      vendor: {
        select: { name: true }
      },
      cashierSchedule: true,
    }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check vendor access
  if (req.user?.role !== 'superadmin' && user.vendorId !== req.user?.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this user'
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      vendorId: user.vendorId,
      vendorName: user.vendor?.name,
      isActive: user.isActive,
      terminalId: user.terminalId,
      assignedLocations: user.assignedLocations,
      lastLogin: user.lastLogin,
      workSchedule: user.cashierSchedule ? {
        checkInTime: user.cashierSchedule.checkInTime,
        checkOutTime: user.cashierSchedule.checkOutTime,
        workDays: user.cashierSchedule.workDays,
        timezone: user.cashierSchedule.timezone,
        isActive: user.cashierSchedule.isActive
      } : null,
      createdAt: user.createdAt
    }
  });
});

// @desc    Create new user (cashier)
// @route   POST /api/users
// @access  Private (Vendor)
export const createUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { vendorId, name, email, password, role, terminalId, assignedLocations } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Hash password
  const hashedPassword = hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashedPassword,
      role: role.toUpperCase(),
      vendorId,
      terminalId,
      assignedLocations: assignedLocations || []
    },
    include: {
      vendor: {
        select: { name: true }
      }
    }
  });

  return res.status(201).json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      vendorId: user.vendorId,
      vendorName: user.vendor?.name,
      isActive: user.isActive,
      terminalId: user.terminalId,
      assignedLocations: user.assignedLocations,
      createdAt: user.createdAt
    }
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Vendor, Superadmin)
export const updateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, email, isActive, terminalId, assignedLocations } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { id }
  });

  if (!existingUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check vendor access
  if (req.user?.role !== 'superadmin' && existingUser.vendorId !== req.user?.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this user'
    });
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(typeof isActive === 'boolean' && { isActive }),
      ...(terminalId && { terminalId }),
      ...(assignedLocations && { assignedLocations })
    },
    include: {
      vendor: {
        select: { name: true }
      },
      cashierSchedule: true
    }
  });

  return res.status(200).json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      vendorId: user.vendorId,
      vendorName: user.vendor?.name,
      isActive: user.isActive,
      terminalId: user.terminalId,
      assignedLocations: user.assignedLocations,
      workSchedule: user.cashierSchedule ? {
        checkInTime: user.cashierSchedule.checkInTime,
        checkOutTime: user.cashierSchedule.checkOutTime,
        workDays: user.cashierSchedule.workDays,
        timezone: user.cashierSchedule.timezone,
        isActive: user.cashierSchedule.isActive
      } : null,
      updatedAt: user.updatedAt
    }
  });
});

// @desc    Update cashier work schedule
// @route   PUT /api/users/:id/schedule
// @access  Private (Vendor)
export const updateCashierSchedule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { checkInTime, checkOutTime, workDays, timezone, isActive } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check vendor access and role
  if (user.vendorId !== req.user?.vendorId || user.role !== 'CASHIER') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this cashier schedule'
    });
  }

  // Check if schedule exists
  let schedule = await prisma.cashierSchedule.findUnique({
    where: { userId: id }
  });

  if (schedule) {
    // Update existing schedule
    schedule = await prisma.cashierSchedule.update({
      where: { userId: id },
      data: {
        checkInTime,
        checkOutTime,
        workDays,
        ...(timezone && { timezone }),
        ...(typeof isActive === 'boolean' && { isActive })
      }
    });
  } else {
    // Create new schedule
    schedule = await prisma.cashierSchedule.create({
      data: {
        userId: id,
        checkInTime,
        checkOutTime,
        workDays,
        timezone: timezone || 'UTC',
        isActive: isActive !== false
      }
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      id: schedule.id,
      userId: schedule.userId,
      checkInTime: schedule.checkInTime,
      checkOutTime: schedule.checkOutTime,
      workDays: schedule.workDays,
      timezone: schedule.timezone,
      isActive: schedule.isActive,
      updatedAt: schedule.updatedAt
    }
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Vendor, Superadmin)
export const deleteUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check vendor access
  if (req.user?.role !== 'superadmin' && user.vendorId !== req.user?.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this user'
    });
  }

  // Prevent deletion of vendor users
  if (user.role === 'VENDOR') {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete vendor users'
    });
  }

  await prisma.user.delete({
    where: { id }
  });

  return res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});
