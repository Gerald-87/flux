import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../server';
import bcrypt from 'bcryptjs';

// Generate temporary password
const generateTempPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// @desc    Create cashier for vendor (SuperAdmin only)
// @route   POST /api/vendors/:id/cashiers
// @access  Private (SuperAdmin)
export const createCashier = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { id: vendorId } = req.params;
  const { name, email, role = 'CASHIER' } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Verify vendor exists
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId }
  });

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor not found'
    });
  }

  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 12);

  const cashier = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashedPassword,
      role: role.toUpperCase(),
      vendorId,
      isActive: true
    },
    include: {
      vendor: {
        select: {
          name: true
        }
      }
    }
  });

  return res.status(201).json({
    success: true,
    data: {
      id: cashier.id,
      name: cashier.name,
      email: cashier.email,
      vendorName: cashier.vendor?.name,
      role: cashier.role,
      isActive: cashier.isActive,
      createdAt: cashier.createdAt
    },
    tempPassword,
    message: 'Cashier created successfully. Temporary password generated.'
  });
});
