import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../server';

// @desc    Get all customers for vendor
// @route   GET /api/customers
// @access  Private (Vendor, Cashier)
export const getCustomers = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const vendorId = req.user?.vendorId;
  const { search, page = 1, limit = 20, isActive = 'true' } = req.query;

  if (!vendorId) {
    return res.status(400).json({
      success: false,
      message: 'Vendor ID is required'
    });
  }

  const where: any = { vendorId };

  // Filter by active status
  if (isActive !== 'all') {
    where.isActive = isActive === 'true';
  }

  // Search functionality
  if (search) {
    where.OR = [
      { name: { contains: search as string } },
      { email: { contains: search as string } },
      { phone: { contains: search as string } }
    ];
  }

  const customers = await prisma.customer.findMany({
    where,
    include: {
      _count: {
        select: {
          sales: true
        }
      }
    },
    orderBy: { name: 'asc' },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
  });

  const total = await prisma.customer.count({ where });

  return res.status(200).json({
    success: true,
    data: customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      dateOfBirth: customer.dateOfBirth,
      loyaltyPoints: customer.loyaltyPoints,
      totalSpent: customer.totalSpent,
      visitCount: customer.visitCount,
      lastVisit: customer.lastVisit,
      isActive: customer.isActive,
      salesCount: customer._count.sales,
      createdAt: customer.createdAt
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private (Vendor, Cashier)
export const getCustomer = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      sales: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          receiptNumber: true,
          total: true,
          paymentMethod: true,
          createdAt: true
        }
      },
      _count: {
        select: {
          sales: true
        }
      }
    }
  });

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  // Check vendor access
  if (req.user?.role !== 'superadmin' && customer.vendorId !== req.user?.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this customer'
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      dateOfBirth: customer.dateOfBirth,
      loyaltyPoints: customer.loyaltyPoints,
      totalSpent: customer.totalSpent,
      visitCount: customer.visitCount,
      lastVisit: customer.lastVisit,
      isActive: customer.isActive,
      notes: customer.notes,
      recentSales: customer.sales,
      totalSales: customer._count.sales,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    }
  });
});

// @desc    Get customer sales history
// @route   GET /api/customers/:id/sales
// @access  Private (Vendor, Cashier)
export const getCustomerSales = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Verify customer exists and belongs to vendor
  const customer = await prisma.customer.findUnique({
    where: { id }
  });

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  // Check vendor access
  if (req.user?.role !== 'superadmin' && customer.vendorId !== req.user?.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this customer'
    });
  }

  const sales = await prisma.sale.findMany({
    where: { customerId: id },
    include: {
      cashier: {
        select: { name: true }
      },
      items: {
        include: {
          product: {
            select: { name: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
  });

  const total = await prisma.sale.count({
    where: { customerId: id }
  });

  return res.status(200).json({
    success: true,
    data: sales.map(sale => ({
      id: sale.id,
      receiptNumber: sale.receiptNumber,
      cashier: sale.cashier.name,
      subtotal: sale.subtotal,
      tax: sale.tax,
      discount: sale.discount,
      total: sale.total,
      paymentMethod: sale.paymentMethod,
      status: sale.status,
      loyaltyPointsEarned: sale.loyaltyPointsEarned,
      loyaltyPointsUsed: sale.loyaltyPointsUsed,
      itemCount: sale.items.length,
      items: sale.items.map(item => ({
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      })),
      createdAt: sale.createdAt
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private (Vendor, Cashier)
export const createCustomer = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { vendorId, name, email, phone, address, dateOfBirth, notes } = req.body;

  // Check if customer with email already exists for this vendor
  if (email) {
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        vendorId,
        email
      }
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this email already exists'
      });
    }
  }

  const customer = await prisma.customer.create({
    data: {
      vendorId,
      name,
      email,
      phone,
      address,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      notes
    }
  });

  return res.status(201).json({
    success: true,
    data: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      dateOfBirth: customer.dateOfBirth,
      loyaltyPoints: customer.loyaltyPoints,
      totalSpent: customer.totalSpent,
      visitCount: customer.visitCount,
      isActive: customer.isActive,
      createdAt: customer.createdAt
    }
  });
});

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private (Vendor, Cashier)
export const updateCustomer = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, address, dateOfBirth, notes, isActive } = req.body;

  const existingCustomer = await prisma.customer.findUnique({
    where: { id }
  });

  if (!existingCustomer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  // Check vendor access
  if (existingCustomer.vendorId !== req.user?.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this customer'
    });
  }

  // Check if email is being changed and already exists
  if (email && email !== existingCustomer.email) {
    const emailExists = await prisma.customer.findFirst({
      where: {
        vendorId: existingCustomer.vendorId,
        email,
        id: { not: id }
      }
    });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this email already exists'
      });
    }
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
      ...(notes !== undefined && { notes }),
      ...(typeof isActive === 'boolean' && { isActive })
    }
  });

  return res.status(200).json({
    success: true,
    data: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      dateOfBirth: customer.dateOfBirth,
      loyaltyPoints: customer.loyaltyPoints,
      totalSpent: customer.totalSpent,
      visitCount: customer.visitCount,
      lastVisit: customer.lastVisit,
      isActive: customer.isActive,
      notes: customer.notes,
      updatedAt: customer.updatedAt
    }
  });
});

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private (Vendor)
export const deleteCustomer = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      sales: true
    }
  });

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  // Check vendor access
  if (customer.vendorId !== req.user?.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this customer'
    });
  }

  // Check if customer has sales
  if (customer.sales.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete customer with existing sales. Consider deactivating instead.'
    });
  }

  await prisma.customer.delete({
    where: { id }
  });

  return res.status(200).json({
    success: true,
    message: 'Customer deleted successfully'
  });
});
