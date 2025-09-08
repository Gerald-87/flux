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

// @desc    Get all vendors (SuperAdmin only)
// @route   GET /api/vendors
// @access  Private (SuperAdmin)
export const getVendors = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { page = 1, limit = 10, search, status } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  const where: any = {};
  
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
    ];
  }
  
  if (status) {
    where.subscriptionStatus = status;
  }

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            lastLogin: true,
          }
        },
        _count: {
          select: {
            users: true,
            products: true,
            sales: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.vendor.count({ where })
  ]);

  return res.status(200).json({
    success: true,
    data: vendors,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// @desc    Get vendor by ID (SuperAdmin only)
// @route   GET /api/vendors/:id
// @access  Private (SuperAdmin)
export const getVendor = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { id } = req.params;

  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
        }
      },
      vendorSettings: true,
      _count: {
        select: {
          users: true,
          products: true,
          sales: true,
          customers: true,
        }
      }
    }
  });

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor not found'
    });
  }

  return res.status(200).json({
    success: true,
    data: vendor
  });
});

// @desc    Update vendor status (SuperAdmin only)
// @route   PUT /api/vendors/:id/status
// @access  Private (SuperAdmin)
export const updateVendorStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { id } = req.params;
  const { subscriptionStatus, subscriptionPlan, subscriptionExpiry } = req.body;

  const vendor = await prisma.vendor.update({
    where: { id },
    data: {
      ...(subscriptionStatus && { subscriptionStatus }),
      ...(subscriptionPlan && { subscriptionPlan }),
      ...(subscriptionExpiry && { subscriptionExpiry: new Date(subscriptionExpiry) }),
    },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        }
      }
    }
  });

  return res.status(200).json({
    success: true,
    data: vendor,
    message: 'Vendor status updated successfully'
  });
});

// @desc    Get system analytics (SuperAdmin only)
// @route   GET /api/vendors/analytics
// @access  Private (SuperAdmin)
export const getSystemAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { period = '30d' } = req.query;
  
  let dateFilter: Date;
  switch (period) {
    case '7d':
      dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  const [
    totalVendors,
    activeVendors,
    newVendors,
    totalUsers,
    totalSales,
    activeVendorsForRevenue,
    vendorGrowth
  ] = await Promise.all([
    // Total vendors
    prisma.vendor.count(),
    
    // Active vendors (with recent activity)
    prisma.vendor.count({
      where: {
        users: {
          some: {
            lastLogin: {
              gte: dateFilter
            }
          }
        }
      }
    }),
    
    // New vendors in period
    prisma.vendor.count({
      where: {
        createdAt: {
          gte: dateFilter
        }
      }
    }),
    
    // Total users across all vendors
    prisma.user.count({
      where: {
        role: {
          in: ['VENDOR', 'CASHIER']
        }
      }
    }),
    
    // Total sales count
    prisma.sale.count(),
    
    // Active vendors for revenue calculation
    prisma.vendor.findMany({
      where: {
        subscriptionStatus: 'ACTIVE'
      },
      select: {
        subscriptionPlan: true
      }
    }),
    
    // Vendor growth over time
    prisma.vendor.groupBy({
      by: ['createdAt'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: dateFilter
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
  ]);

  // Get pricing plans to calculate revenue
  const pricingPlans = await prisma.pricingPlan.findMany();
  const pricingPlanMap = new Map(pricingPlans.map(plan => [plan.name, Number(plan.price)]));

  // Calculate total revenue from active subscriptions
  const totalRevenue = activeVendorsForRevenue.reduce((sum, vendor) => {
    const planPrice = pricingPlanMap.get(vendor.subscriptionPlan) || 0;
    return sum + planPrice;
  }, 0);

  // Process vendor growth data for chart
  const growthData = vendorGrowth.map(item => ({
    date: item.createdAt.toISOString().split('T')[0],
    count: item._count.id
  }));

  return res.status(200).json({
    success: true,
    data: {
      overview: {
        totalVendors,
        activeVendors,
        newVendors,
        totalUsers,
        totalSales,
        totalRevenue
      },
      growth: growthData
    }
  });
});

// @desc    Get support tickets (SuperAdmin only)
// @route   GET /api/vendors/support-tickets
// @access  Private (SuperAdmin)
export const getSupportTickets = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { page = 1, limit = 10, status, priority } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  const where: any = {};
  
  if (status) {
    where.status = status;
  }
  
  if (priority) {
    where.priority = priority;
  }

  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.supportTicket.count({ where })
  ]);

  return res.status(200).json({
    success: true,
    data: tickets,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// @desc    Create support ticket (SuperAdmin only)
// @route   POST /api/vendors/support-tickets
// @access  Private (SuperAdmin)
export const createSupportTicket = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { vendorId, subject, description, priority = 'MEDIUM' } = req.body;

  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId }
  });

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor not found'
    });
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      vendorId,
      vendorName: vendor.name,
      subject,
      description,
      priority,
      status: 'OPEN'
    },
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    }
  });

  return res.status(201).json({
    success: true,
    data: ticket,
    message: 'Support ticket created successfully'
  });
});

// @desc    Update support ticket (SuperAdmin only)
// @route   PUT /api/vendors/support-tickets/:id
// @access  Private (SuperAdmin)
export const updateSupportTicket = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { id } = req.params;
  const { subject, description, status, priority } = req.body;

  const ticket = await prisma.supportTicket.update({
    where: { id },
    data: {
      ...(subject && { subject }),
      ...(description && { description }),
      ...(status && { status }),
      ...(priority && { priority }),
    },
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    }
  });

  return res.status(200).json({
    success: true,
    data: ticket,
    message: 'Support ticket updated successfully'
  });
});

// @desc    Delete support ticket (SuperAdmin only)
// @route   DELETE /api/vendors/support-tickets/:id
// @access  Private (SuperAdmin)
export const deleteSupportTicket = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { id } = req.params;

  await prisma.supportTicket.delete({
    where: { id }
  });

  return res.status(200).json({
    success: true,
    message: 'Support ticket deleted successfully'
  });
});

// @desc    Create vendor (SuperAdmin only)
// @route   POST /api/vendors
// @access  Private (SuperAdmin)
export const createVendor = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { name, email, phone, address, businessType, subscriptionPlan = 'TRIAL' } = req.body;

  // Check if vendor already exists
  const existingVendor = await prisma.vendor.findUnique({
    where: { email }
  });

  if (existingVendor) {
    return res.status(400).json({
      success: false,
      message: 'Vendor with this email already exists'
    });
  }

  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 12);

  const result = await prisma.$transaction(async (tx: any) => {
    // Create vendor
    const vendor = await tx.vendor.create({
      data: {
        name,
        email,
        phone,
        address,
        businessType,
        subscriptionPlan,
        subscriptionStatus: 'TRIALING',
        subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isApproved: true
      }
    });

    // Create vendor settings
    await tx.vendorSettings.create({
      data: {
        vendorId: vendor.id,
      }
    });

    // Create admin user for the vendor
    await tx.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role: 'VENDOR_ADMIN',
        vendorId: vendor.id,
        isActive: true
      }
    });

    return { vendor, tempPassword };
  });

  return res.status(201).json({
    success: true,
    data: result.vendor,
    tempPassword: result.tempPassword,
    message: 'Vendor created successfully. Temporary password generated.'
  });
});

// @desc    Delete vendor (SuperAdmin only)
// @route   DELETE /api/vendors/:id
// @access  Private (SuperAdmin)
export const deleteVendor = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { id } = req.params;

  await prisma.vendor.delete({
    where: { id }
  });

  return res.status(200).json({
    success: true,
    message: 'Vendor deleted successfully'
  });
});

// @desc    Get pricing plans (SuperAdmin only)
// @route   GET /api/vendors/pricing-plans
// @access  Private (SuperAdmin)
export const getPricingPlans = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { page = 1, limit = 10 } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);

  const [plans, total] = await Promise.all([
    prisma.pricingPlan.findMany({
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.pricingPlan.count()
  ]);

  return res.status(200).json({
    success: true,
    data: plans,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// @desc    Create pricing plan (SuperAdmin only)
// @route   POST /api/vendors/pricing-plans
// @access  Private (SuperAdmin)
export const createPricingPlan = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { name, price, duration, features, isActive = true } = req.body;

  const plan = await prisma.pricingPlan.create({
    data: {
      name,
      price: Number(price),
      duration: Number(duration),
      features: Array.isArray(features) ? features : [],
      isActive: Boolean(isActive)
    }
  });

  return res.status(201).json({
    success: true,
    data: plan,
    message: 'Pricing plan created successfully'
  });
});

// @desc    Update pricing plan (SuperAdmin only)
// @route   PUT /api/vendors/pricing-plans/:id
// @access  Private (SuperAdmin)
export const updatePricingPlan = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { id } = req.params;
  const { name, price, duration, features, isActive } = req.body;

  const plan = await prisma.pricingPlan.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(price !== undefined && { price: Number(price) }),
      ...(duration !== undefined && { duration: Number(duration) }),
      ...(features && { features: Array.isArray(features) ? features : [] }),
      ...(isActive !== undefined && { isActive: Boolean(isActive) })
    }
  });

  return res.status(200).json({
    success: true,
    data: plan,
    message: 'Pricing plan updated successfully'
  });
});

// @desc    Delete pricing plan (SuperAdmin only)
// @route   DELETE /api/vendors/pricing-plans/:id
// @access  Private (SuperAdmin)
export const deletePricingPlan = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { id } = req.params;

  await prisma.pricingPlan.delete({
    where: { id }
  });

  return res.status(200).json({
    success: true,
    message: 'Pricing plan deleted successfully'
  });
});

// @desc    Get all cashiers (SuperAdmin only)
// @route   GET /api/vendors/cashiers
// @access  Private (SuperAdmin)
export const getCashiers = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { page = 1, limit = 10, search } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  const where: any = {
    role: {
      in: ['CASHIER', 'MANAGER']
    }
  };
  
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [cashiers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        vendor: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count({ where })
  ]);

  const formattedCashiers = cashiers.map(cashier => ({
    id: cashier.id,
    name: cashier.name,
    email: cashier.email,
    vendorName: cashier.vendor?.name || 'N/A',
    role: cashier.role,
    isActive: cashier.isActive,
    lastLogin: cashier.lastLogin,
    createdAt: cashier.createdAt
  }));

  return res.status(200).json({
    success: true,
    data: formattedCashiers,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});
