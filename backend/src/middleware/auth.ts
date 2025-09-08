import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// import { PrismaClient } from '@prisma/client';
import { asyncHandler } from './errorHandler';
import { prisma } from '../server';

// const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    vendorId?: string | null;
    name: string;
  };
}

// Protect routes - verify JWT token
export const protect = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        vendorId: true,
        name: true,
        isActive: true,
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as string,
      vendorId: user.vendorId || undefined,
      name: user.name
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
});

// Grant access to specific roles
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): any => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user?.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Ensure vendor data isolation
export const vendorAccess = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  // Superadmin can access all vendor data
  if (req.user.role === 'superadmin') {
    return next();
  }

  // Vendors and cashiers can only access their own vendor's data
  if (!req.user.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'No vendor association found'
    });
  }

  // Add vendorId to request for filtering
  req.body.vendorId = req.user.vendorId;
  next();
});

// Time-based access control for cashiers
export const timeBasedAccess = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
  if (!req.user || req.user.role !== 'cashier') {
    return next(); // Skip time check for non-cashiers
  }

  // Get cashier schedule
  const schedule = await prisma.cashierSchedule.findUnique({
    where: { userId: req.user.id }
  });

  if (!schedule || !schedule.isActive) {
    return next(); // No schedule means no time restrictions
  }

  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.toTimeString().slice(0, 5);
  const workDays = schedule.workDays as number[];

  // Check if today is a work day
  if (!workDays.includes(currentDay)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Not a scheduled work day'
    });
  }

  // Check if current time is within work hours
  if (currentTime < schedule.checkInTime || currentTime > schedule.checkOutTime) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Outside of scheduled work hours'
    });
  }

  next();
});
