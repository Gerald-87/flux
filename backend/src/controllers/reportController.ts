import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// @desc    Get all reports for vendor
// @route   GET /api/reports
// @access  Private (Vendor)
export const getReports = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { vendorId } = req.body;
  const { type, period, page = 1, limit = 20 } = req.query;

  const where: any = { vendorId };

  // Filter by type
  if (type) {
    where.type = type.toString().toUpperCase();
  }

  // Filter by period
  if (period) {
    where.period = period.toString().toUpperCase();
  }

  const reports = await prisma.report.findMany({
    where,
    include: {
      generator: {
        select: { name: true }
      }
    },
    orderBy: { generatedAt: 'desc' },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
  });

  const total = await prisma.report.count({ where });

  res.status(200).json({
    success: true,
    data: reports.map(report => ({
      id: report.id,
      type: report.type,
      period: report.period,
      startDate: report.startDate,
      endDate: report.endDate,
      generatedBy: report.generator.name,
      generatedAt: report.generatedAt,
      dataSize: JSON.stringify(report.data).length
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private (Vendor)
export const getReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      generator: {
        select: { name: true }
      }
    }
  });

  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Report not found'
    });
  }

  // Check vendor access
  if (report.vendorId !== req.user?.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this report'
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      id: report.id,
      type: report.type,
      period: report.period,
      startDate: report.startDate,
      endDate: report.endDate,
      data: report.data,
      generatedBy: report.generator.name,
      generatedAt: report.generatedAt
    }
  });
});

// @desc    Generate new report
// @route   POST /api/reports/generate
// @access  Private (Vendor)
export const generateReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { vendorId, type, period, startDate, endDate } = req.body;

  const start = new Date(startDate);
  const end = new Date(endDate);

  let reportData: any = {};

  switch (type.toLowerCase()) {
    case 'sales':
      reportData = await generateSalesReport(vendorId, start, end);
      break;
    case 'inventory':
      reportData = await generateInventoryReport(vendorId, start, end);
      break;
    case 'customer':
      reportData = await generateCustomerReport(vendorId, start, end);
      break;
    case 'profit':
      reportData = await generateProfitReport(vendorId, start, end);
      break;
    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid report type'
      });
  }

  const report = await prisma.report.create({
    data: {
      vendorId,
      type: type.toUpperCase(),
      period: period.toUpperCase(),
      startDate: start,
      endDate: end,
      data: reportData,
      generatedBy: req.user!.id
    }
  });

  return res.status(201).json({
    success: true,
    data: {
      id: report.id,
      type: report.type,
      period: report.period,
      startDate: report.startDate,
      endDate: report.endDate,
      generatedAt: report.generatedAt
    }
  });
});

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private (Vendor)
export const deleteReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const report = await prisma.report.findUnique({
    where: { id }
  });

  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Report not found'
    });
  }

  // Check vendor access
  if (report.vendorId !== req.user?.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this report'
    });
  }

  await prisma.report.delete({
    where: { id }
  });

  return res.status(200).json({
    success: true,
    message: 'Report deleted successfully'
  });
});

// Helper functions for generating different report types
async function generateSalesReport(vendorId: string, startDate: Date, endDate: Date) {
  const [
    totalSales,
    salesByDay,
    salesByPaymentMethod,
    salesByCashier,
    topProducts
  ] = await Promise.all([
    // Total sales summary
    prisma.sale.aggregate({
      where: {
        vendorId,
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate }
      },
      _sum: { total: true, tax: true, discount: true },
      _count: true,
      _avg: { total: true }
    }),

    // Daily sales breakdown
    prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        SUM(total) as total,
        COUNT(*) as count,
        AVG(total) as average
      FROM sales 
      WHERE vendor_id = ${vendorId} 
        AND status = 'COMPLETED'
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `,

    // Sales by payment method
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

    // Sales by cashier
    prisma.sale.groupBy({
      by: ['cashierId'],
      where: {
        vendorId,
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate }
      },
      _sum: { total: true },
      _count: true,
      orderBy: { _sum: { total: 'desc' } }
    }),

    // Top selling products
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
    })
  ]);

  return {
    summary: {
      totalRevenue: totalSales._sum.total || 0,
      totalTax: totalSales._sum.tax || 0,
      totalDiscount: totalSales._sum.discount || 0,
      transactionCount: totalSales._count,
      averageTransaction: totalSales._avg.total || 0
    },
    dailySales: salesByDay,
    paymentMethods: salesByPaymentMethod,
    cashierPerformance: salesByCashier,
    topProducts
  };
}

async function generateInventoryReport(vendorId: string, startDate: Date, endDate: Date) {
  const [
    totalProducts,
    lowStockProducts,
    stockMovements,
    categoryBreakdown
  ] = await Promise.all([
    // Total products summary
    prisma.product.aggregate({
      where: { vendorId, isActive: true },
      _count: true,
      _sum: { totalStock: true }
    }),

    // Low stock products
    prisma.product.findMany({
      where: {
        vendorId,
        isActive: true,
        OR: [
          { totalStock: { lte: prisma.product.fields.minStock } }
        ]
      },
      select: {
        id: true,
        name: true,
        sku: true,
        totalStock: true,
        minStock: true,
        category: true
      }
    }),

    // Stock movements in period
    prisma.stockMovement.groupBy({
      by: ['movementType'],
      where: {
        vendorId,
        createdAt: { gte: startDate, lte: endDate }
      },
      _sum: { quantity: true },
      _count: true
    }),

    // Products by category
    prisma.product.groupBy({
      by: ['category'],
      where: { vendorId, isActive: true },
      _count: true,
      _sum: { totalStock: true }
    })
  ]);

  return {
    summary: {
      totalProducts: totalProducts._count,
      totalStock: totalProducts._sum.totalStock || 0,
      lowStockCount: lowStockProducts.length
    },
    lowStockProducts,
    stockMovements,
    categoryBreakdown
  };
}

async function generateCustomerReport(vendorId: string, startDate: Date, endDate: Date) {
  const [
    customerStats,
    topCustomers,
    newCustomers,
    loyaltyStats
  ] = await Promise.all([
    // Customer statistics
    prisma.customer.aggregate({
      where: { vendorId, isActive: true },
      _count: true,
      _sum: { totalSpent: true, loyaltyPoints: true },
      _avg: { totalSpent: true, visitCount: true }
    }),

    // Top customers by spending
    prisma.customer.findMany({
      where: { vendorId, isActive: true },
      orderBy: { totalSpent: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        totalSpent: true,
        visitCount: true,
        loyaltyPoints: true
      }
    }),

    // New customers in period
    prisma.customer.count({
      where: {
        vendorId,
        createdAt: { gte: startDate, lte: endDate }
      }
    }),

    // Loyalty program stats
    prisma.sale.aggregate({
      where: {
        vendorId,
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate },
        customerId: { not: null }
      },
      _sum: { loyaltyPointsEarned: true, loyaltyPointsUsed: true }
    })
  ]);

  return {
    summary: {
      totalCustomers: customerStats._count,
      totalSpent: customerStats._sum.totalSpent || 0,
      averageSpent: customerStats._avg.totalSpent || 0,
      averageVisits: customerStats._avg.visitCount || 0,
      newCustomers
    },
    topCustomers,
    loyaltyProgram: {
      pointsEarned: loyaltyStats._sum.loyaltyPointsEarned || 0,
      pointsUsed: loyaltyStats._sum.loyaltyPointsUsed || 0
    }
  };
}

async function generateProfitReport(vendorId: string, startDate: Date, endDate: Date) {
  const [
    salesData,
    purchaseData,
    productProfitability
  ] = await Promise.all([
    // Sales revenue
    prisma.sale.aggregate({
      where: {
        vendorId,
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate }
      },
      _sum: { total: true, tax: true, discount: true }
    }),

    // Purchase costs
    prisma.purchase.aggregate({
      where: {
        vendorId,
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate }
      },
      _sum: { total: true }
    }),

    // Product profitability
    prisma.$queryRaw`
      SELECT 
        p.id,
        p.name,
        p.category,
        SUM(si.quantity) as units_sold,
        SUM(si.total) as revenue,
        SUM(si.quantity * p.cost_price) as cost,
        SUM(si.total) - SUM(si.quantity * p.cost_price) as profit
      FROM products p
      JOIN sale_items si ON p.id = si.product_id
      JOIN sales s ON si.sale_id = s.id
      WHERE p.vendor_id = ${vendorId}
        AND s.status = 'COMPLETED'
        AND s.created_at >= ${startDate}
        AND s.created_at <= ${endDate}
      GROUP BY p.id, p.name, p.category
      ORDER BY profit DESC
      LIMIT 10
    `
  ]);

  const revenue = Number(salesData._sum.total || 0);
  const costs = Number(purchaseData._sum.total || 0);
  const grossProfit = revenue - costs;
  const profitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  return {
    summary: {
      revenue,
      costs,
      grossProfit,
      profitMargin,
      tax: salesData._sum.tax || 0,
      discounts: salesData._sum.discount || 0
    },
    productProfitability
  };
}
