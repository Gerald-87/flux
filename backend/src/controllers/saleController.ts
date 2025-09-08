import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../server';

// Generate receipt number
const generateReceiptNumber = (vendorId: string): string => {
  const timestamp = Date.now().toString().slice(-6);
  const vendorPrefix = vendorId.slice(0, 3).toUpperCase();
  return `${vendorPrefix}-${timestamp}`;
};

// @desc    Get all sales for vendor
// @route   GET /api/sales
// @access  Private (Vendor, Cashier)
export const getSales = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const vendorId = req.user?.vendorId;
  const { 
    cashierId, 
    customerId, 
    paymentMethod, 
    status, 
    startDate, 
    endDate, 
    page = 1, 
    limit = 20 
  } = req.query;

  if (!vendorId) {
    return res.status(400).json({
      success: false,
      message: 'Vendor ID is required'
    });
  }

  const where: any = { vendorId };

  // For cashiers, only show their own sales
  if (req.user?.role === 'cashier') {
    where.cashierId = req.user.id;
  } else if (cashierId) {
    where.cashierId = cashierId;
  }

  // Filter by customer
  if (customerId) {
    where.customerId = customerId;
  }

  // Filter by payment method
  if (paymentMethod) {
    where.paymentMethod = paymentMethod;
  }

  // Filter by status
  if (status) {
    where.status = status;
  }

  // Date range filter
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate as string);
    }
  }

  const sales = await prisma.sale.findMany({
    where,
    include: {
      cashier: {
        select: { name: true }
      },
      customer: {
        select: { name: true, email: true }
      },
      items: {
        include: {
          product: {
            select: { name: true, category: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
  });

  const total = await prisma.sale.count({ where });

  return res.status(200).json({
    success: true,
    data: sales.map(sale => ({
      id: sale.id,
      receiptNumber: sale.receiptNumber,
      cashier: sale.cashier.name,
      customer: sale.customer ? {
        name: sale.customer.name,
        email: sale.customer.email
      } : null,
      terminalId: sale.terminalId,
      subtotal: sale.subtotal,
      tax: sale.tax,
      discount: sale.discount,
      total: sale.total,
      paid: sale.paid,
      changeAmount: sale.changeAmount,
      paymentMethod: sale.paymentMethod,
      status: sale.status,
      refundAmount: sale.refundAmount,
      loyaltyPointsEarned: sale.loyaltyPointsEarned,
      loyaltyPointsUsed: sale.loyaltyPointsUsed,
      itemCount: sale.items.length,
      items: sale.items.map(item => ({
        id: item.id,
        productName: item.product?.name || item.name,
        category: item.product.category,
        sku: item.sku,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
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

// @desc    Get sales analytics
// @route   GET /api/sales/analytics
// @access  Private (Vendor)
export const getSalesAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { vendorId } = req.body;
  const { period = 'week' } = req.query;

  let startDate: Date;
  const endDate = new Date();

  switch (period) {
    case 'day':
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'year':
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
  }

  const [
    totalSales,
    salesCount,
    paymentMethods,
    topCashiers,
    topProducts,
    dailySales
  ] = await Promise.all([
    // Total sales amount
    prisma.sale.aggregate({
      where: {
        vendorId,
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate }
      },
      _sum: { total: true }
    }),

    // Sales count
    prisma.sale.count({
      where: {
        vendorId,
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate }
      }
    }),

    // Payment methods breakdown
    prisma.sale.groupBy({
      by: ['paymentMethod'],
      where: {
        vendorId,
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate }
      },
      _sum: { total: true },
      _count: true
    }),

    // Top cashiers
    prisma.sale.groupBy({
      by: ['cashierId'],
      where: {
        vendorId,
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate }
      },
      _sum: { total: true },
      _count: true,
      orderBy: { _sum: { total: 'desc' } },
      take: 5
    }),

    // Top products
    prisma.saleItem.groupBy({
      by: ['productId'],
      where: {
        sale: {
          vendorId,
          status: 'COMPLETED',
          createdAt: { gte: startDate, lte: endDate }
        }
      },
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 10
    }),

    // Daily sales for chart
    prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        SUM(total) as total,
        COUNT(*) as count
      FROM sales 
      WHERE vendor_id = ${vendorId} 
        AND status = 'COMPLETED'
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `
  ]);

  // Get cashier names
  const cashierIds = topCashiers.map(c => c.cashierId);
  const cashiers = await prisma.user.findMany({
    where: { id: { in: cashierIds } },
    select: { id: true, name: true }
  });

  // Get product names
  const productIds = topProducts.map(p => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, category: true }
  });

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalSales: totalSales._sum.total || 0,
        salesCount,
        averageSale: salesCount > 0 ? Number(totalSales._sum.total || 0) / salesCount : 0,
        period
      },
      paymentMethods: paymentMethods.map(pm => ({
        method: pm.paymentMethod,
        total: pm._sum.total || 0,
        count: pm._count,
        percentage: (Number(pm._sum.total || 0) / Number(totalSales._sum.total || 1)) * 100
      })),
      topCashiers: topCashiers.map(tc => {
        const cashier = cashiers.find(c => c.id === tc.cashierId);
        return {
          cashierId: tc.cashierId,
          name: cashier?.name || 'Unknown',
          total: tc._sum.total || 0,
          count: tc._count
        };
      }),
      topProducts: topProducts.map(tp => {
        const product = products.find(p => p.id === tp.productId);
        return {
          productId: tp.productId,
          name: product?.name || 'Unknown',
          category: product?.category,
          quantity: tp._sum.quantity || 0,
          total: tp._sum.total || 0
        };
      }),
      dailySales: dailySales as any[]
    }
  });
});

// @desc    Get single sale
// @route   GET /api/sales/:id
// @access  Private (Vendor, Cashier)
export const getSale = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      cashier: {
        select: { name: true, email: true }
      },
      customer: true,
      items: {
        include: {
          product: {
            select: { name: true, category: true, brand: true }
          },
          variant: {
            select: { name: true, value: true }
          }
        }
      }
    }
  });

  if (!sale) {
    return res.status(404).json({
      success: false,
      message: 'Sale not found'
    });
  }

  // Check vendor access
  if (req.user?.role !== 'superadmin' && sale.vendorId !== req.user?.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this sale'
    });
  }

  // For cashiers, only show their own sales
  if (req.user?.role === 'cashier' && sale.cashierId !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this sale'
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      id: sale.id,
      receiptNumber: sale.receiptNumber,
      total: sale.total,
      subtotal: sale.subtotal,
      tax: sale.tax,
      discount: sale.discount,
      paymentMethod: sale.paymentMethod,
      paid: sale.paid,
      changeAmount: sale.changeAmount,
      status: sale.status,
      notes: sale.notes,
      cashierId: sale.cashierId,
      customerId: sale.customerId,
      customer: sale.customer ? {
        id: sale.customer.id,
        name: sale.customer.name,
        email: sale.customer.email,
        phone: sale.customer.phone
      } : null,
      items: sale.items,
      createdAt: sale.createdAt
    }
  });
});

// @desc    Get receipt data for sale
// @route   GET /api/sales/:id/receipt
// @access  Private (Vendor, Cashier)
export const getReceiptData = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      vendor: {
        include: {
          vendorSettings: true
        }
      },
      cashier: {
        select: { name: true }
      },
      customer: true,
      items: {
        include: {
          product: {
            select: { name: true }
          }
        }
      }
    }
  });

  if (!sale) {
    return res.status(404).json({
      success: false,
      message: 'Sale not found'
    });
  }

  // Check vendor access
  if (req.user?.role !== 'superadmin' && sale.vendorId !== req.user?.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this sale'
    });
  }

  const vendor = await prisma.vendor.findUnique({
    where: { id: sale.vendorId },
    include: {
      vendorSettings: true
    }
  });

  const receiptData = {
    receiptNumber: sale.receiptNumber,
    date: sale.createdAt,
    cashier: sale.cashier.name,
    customer: sale.customer ? {
      name: sale.customer.name,
      email: sale.customer.email,
      phone: sale.customer.phone,
      loyaltyPoints: sale.customer.loyaltyPoints
    } : null,
    items: sale.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.total
    })),
    subtotal: sale.subtotal,
    tax: sale.tax,
    discount: sale.discount,
    total: sale.total,
    paymentMethod: sale.paymentMethod,
    paid: sale.paid,
    changeAmount: sale.changeAmount,
    loyaltyPointsEarned: sale.loyaltyPointsEarned,
    notes: sale.notes,
    vendor: {
      name: vendor?.name || '',
      address: vendor?.address || '',
      phone: vendor?.phone || '',
      email: vendor?.email || ''
    }
  };

  return res.status(200).json({
    success: true,
    data: receiptData
  });
});

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private (Vendor, Cashier)
export const createSale = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { vendorId, customerId, items, paymentMethod, paymentAmount, notes, discountAmount = 0 } = req.body;
  const cashierId = req.user!.id;

  // Calculate totals
  let subtotal = 0;
  for (const item of items) {
    subtotal += Number(item.price) * item.quantity;
  }

  // Get vendor settings for tax calculation
  const vendorSettings = await prisma.vendorSettings.findUnique({
    where: { vendorId }
  });

  const taxRate = Number(vendorSettings?.taxRate || 0);
  const tax = (subtotal - Number(discountAmount)) * taxRate;
  const total = subtotal - Number(discountAmount) + tax;

  // Validate payment amount
  if (Number(paymentAmount) < total) {
    return res.status(400).json({
      success: false,
      message: 'Payment amount is insufficient'
    });
  }

  // Get vendor settings for loyalty calculation
  const loyaltyPointsPerDollar = Number(vendorSettings?.loyaltyPointsPerDollar || 1);
  const loyaltyPointsEarned = Math.floor(total * Number(loyaltyPointsPerDollar));

  const result = await prisma.$transaction(async (tx) => {
    // Generate receipt number
    const receiptNumber = generateReceiptNumber(vendorId);

    // Create sale
    const sale = await tx.sale.create({
      data: {
        vendorId,
        cashierId,
        customerId,
        terminalId: 'default',
        receiptNumber,
        subtotal,
        tax,
        discount: Number(discountAmount),
        total,
        paymentMethod,
        paid: Number(paymentAmount),
        changeAmount: Number(paymentAmount) - total,
        loyaltyPointsEarned,
        notes,
        status: 'COMPLETED'
      }
    });

    // Create sale items
    const saleItems = await Promise.all(
      items.map((item: any) =>
        tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: item.productId,
            variantId: item.variantId,
            name: item.name,
            sku: item.sku,
            quantity: item.quantity,
            price: Number(item.price),
            discount: Number(item.discount || 0),
            total: Number(item.price) * item.quantity - Number(item.discount || 0)
          }
        })
      )
    );

    // Update customer loyalty points if customer exists
    let updatedCustomer = null;
    if (customerId) {
      updatedCustomer = await tx.customer.update({
        where: { id: customerId },
        data: {
          loyaltyPoints: { increment: loyaltyPointsEarned },
          totalSpent: { increment: total },
          lastVisit: new Date()
        }
      });
    }

    return { sale, items: saleItems, customer: updatedCustomer };
  });

  return res.status(201).json({
    success: true,
    data: {
      sale: {
        id: result.sale.id,
        receiptNumber: result.sale.receiptNumber,
        total: result.sale.total,
        subtotal: result.sale.subtotal,
        tax: result.sale.tax,
        discount: result.sale.discount,
        paymentMethod: result.sale.paymentMethod,
        paid: result.sale.paid,
        changeAmount: result.sale.changeAmount,
        loyaltyPointsEarned: result.sale.loyaltyPointsEarned,
        status: result.sale.status,
        notes: result.sale.notes,
        createdAt: result.sale.createdAt
      },
      customerId: result.sale.customerId,
      customer: result.customer ? {
        id: result.customer.id,
        name: result.customer.name,
        loyaltyPoints: result.customer.loyaltyPoints
      } : null,
      items: result.items
    }
  });
});

// @desc    Process sale refund
// @route   PUT /api/sales/:id/refund
// @access  Private (Vendor)
export const refundSale = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { refundAmount, reason } = req.body;

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { items: true }
  });

  if (!sale) {
    return res.status(404).json({
      success: false,
      message: 'Sale not found'
    });
  }

  // Check vendor access
  if (sale.vendorId !== req.user?.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to refund this sale'
    });
  }

  // Validate refund amount
  const maxRefund = Number(sale.total) - Number(sale.refundAmount);
  if (refundAmount > maxRefund) {
    return res.status(400).json({
      success: false,
      message: `Refund amount cannot exceed ${maxRefund}`
    });
  }

  const result = await prisma.$transaction(async (tx) => {
    // Update sale
    const updatedSale = await tx.sale.update({
      where: { id },
      data: {
        refundAmount: sale.refundAmount + refundAmount,
        status: refundAmount >= sale.total ? 'REFUNDED' : 'PARTIAL_REFUND',
        notes: sale.notes ? `${sale.notes}\nRefund: ${reason || 'No reason provided'}` : `Refund: ${reason || 'No reason provided'}`
      }
    });

    // Create audit log
    await tx.auditLog.create({
      data: {
        vendorId: sale.vendorId,
        userId: req.user!.id,
        action: 'REFUND_SALE',
        resource: 'Sale',
        resourceId: sale.id,
        oldValues: { refundAmount: sale.refundAmount, status: sale.status },
        newValues: { refundAmount: updatedSale.refundAmount, status: updatedSale.status }
      }
    });

    return updatedSale;
  });

  return res.status(200).json({
    success: true,
    data: {
      sale: {
        id: result.id,
        receiptNumber: result.receiptNumber,
        refundAmount: result.refundAmount,
        status: result.status,
        updatedAt: result.updatedAt
      },
      refundAmount: sale.refundAmount
    }
  });
});
