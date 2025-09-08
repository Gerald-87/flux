import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
// import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

// const prisma = new PrismaClient();
// Import prisma from server.ts to avoid multiple instances
import { prisma } from '../server';

// Generate JWT Token
const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key';
  const payload = { id };
  const options: SignOptions = { expiresIn: '24h' };
  return jwt.sign(payload, secret, options) as string;
};

// Hash password with MD5 (as requested)
const hashPassword = (password: string): string => {
  return crypto.createHash('md5').update(password).digest('hex');
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      vendor: true,
      cashierSchedule: true,
    }
  });

  if (!user || !user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check password
  const hashedPassword = hashPassword(password);
  if (user.passwordHash !== hashedPassword) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Time-based access control for cashiers
  if (user.role === 'CASHIER' && user.cashierSchedule) {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);
    const workDays = user.cashierSchedule.workDays as number[];

    // Check if today is a work day
    if (!workDays.includes(currentDay)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Today is not a scheduled work day'
      });
    }

    // Check if current time is within work hours
    if (currentTime < user.cashierSchedule.checkInTime || currentTime > user.cashierSchedule.checkOutTime) {
      return res.status(403).json({
        success: false,
        message: `Access denied: Please login between ${user.cashierSchedule.checkInTime} and ${user.cashierSchedule.checkOutTime}`
      });
    }
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() }
  });

  // Generate token
  const token = generateToken(user.id);

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      vendorId: user.vendorId,
      avatar: user.avatar,
      terminalId: user.terminalId,
      assignedLocations: user.assignedLocations,
      workSchedule: user.cashierSchedule ? {
        checkInTime: user.cashierSchedule.checkInTime,
        checkOutTime: user.cashierSchedule.checkOutTime,
        workDays: user.cashierSchedule.workDays,
        timezone: user.cashierSchedule.timezone
      } : null
    }
  });
});

// @desc    Register new vendor
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const { name, email, password, businessType, phone, address } = req.body;

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

  // Create vendor and user in a transaction
  const result = await prisma.$transaction(async (tx: any) => {
    // Create vendor
    const vendor = await tx.vendor.create({
      data: {
        name,
        email,
        phone,
        address,
        businessType,
        subscriptionPlan: 'TRIAL',
        subscriptionStatus: 'TRIALING',
        subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      }
    });

    // Create vendor settings
    await tx.vendorSettings.create({
      data: {
        vendorId: vendor.id,
      }
    });

    // Create user
    const user = await tx.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role: 'VENDOR',
        vendorId: vendor.id,
      }
    });

    return { vendor, user };
  });

  // Generate token
  const token = generateToken(result.user.id);

  res.status(201).json({
    success: true,
    token,
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
      vendorId: result.user.vendorId,
      avatar: result.user.avatar,
    }
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: {
      vendor: true,
      cashierSchedule: true,
    }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      vendorId: user.vendorId,
      avatar: user.avatar,
      terminalId: user.terminalId,
      assignedLocations: user.assignedLocations,
      lastLogin: user.lastLogin,
      workSchedule: user.cashierSchedule ? {
        checkInTime: user.cashierSchedule.checkInTime,
        checkOutTime: user.cashierSchedule.checkOutTime,
        workDays: user.cashierSchedule.workDays,
        timezone: user.cashierSchedule.timezone
      } : null,
      vendor: user.vendor ? {
        id: user.vendor.id,
        name: user.vendor.name,
        subscriptionPlan: user.vendor.subscriptionPlan,
        subscriptionStatus: user.vendor.subscriptionStatus,
      } : null
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { name, phone, avatar } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      ...(name && { name }),
      ...(avatar && { avatar }),
    },
    include: {
      vendor: true,
    }
  });

  // Update vendor phone if user is a vendor
  if (user.role === 'VENDOR' && phone && user.vendorId) {
    await prisma.vendor.update({
      where: { id: user.vendorId },
      data: { phone }
    });
  }

  res.status(200).json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      vendorId: user.vendorId,
      avatar: user.avatar,
    }
  });
});
