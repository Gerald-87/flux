import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Generate purchase number
const generatePurchaseNumber = (vendorId: string): string => {
  const timestamp = Date.now().toString().slice(-6);
  const vendorPrefix = vendorId.slice(0, 3).toUpperCase();
  return `PO-${vendorPrefix}-${timestamp}`;
};

// @desc    Get all purchases for vendor
// @route   GET /api/purchases
// @access  Private (Vendor)
export const getPurchases = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { vendorId } = req.body;
  const { 
    supplierId, 
    status, 
    startDate, 
    endDate, 
    page = 1, 
    limit = 20 
  } = req.query;

  const where: any = { vendorId };

  // Filter by supplier
  if (supplierId) {
    where.supplierId = supplierId;
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

  const purchases = await prisma.purchase.findMany({
    where,
    include: {
      supplier: {
        select: { name: true, contactPerson: true }
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

  const total = await prisma.purchase.count({ where });

  res.status(200).json({
    success: true,
    data: purchases.map(purchase => ({
      id: purchase.id,
      purchaseNumber: purchase.purchaseNumber,
      supplier: {
        name: purchase.supplier.name,
        contactPerson: purchase.supplier.contactPerson
      },
      subtotal: purchase.subtotal,
      tax: purchase.tax,
      total: purchase.total,
      status: purchase.status,
      deliveryDate: purchase.deliveryDate,
      itemCount: purchase.items.length,
      items: purchase.items.map(item => ({
        id: item.id,
        productName: item.product.name,
        category: item.product.category,
        sku: item.sku,
        quantity: item.quantity,
        costPrice: item.costPrice,
        total: item.total
      })),
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// @desc    Get single purchase
// @route   GET /api/purchases/:id
// @access  Private (Vendor)
export const getPurchase = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: {
      supplier: true,
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

  if (!purchase) {
    return res.status(404).json({
      success: false,
      message: 'Purchase not found'
    });
  }

  // Check vendor access
  if (purchase.vendorId !== req.user?.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this purchase'
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      id: purchase.id,
      purchaseNumber: purchase.purchaseNumber,
      supplier: purchase.supplier,
      subtotal: purchase.subtotal,
      tax: purchase.tax,
      total: purchase.total,
      status: purchase.status,
      deliveryDate: purchase.deliveryDate,
      notes: purchase.notes,
      items: purchase.items.map(item => ({
        id: item.id,
        product: {
          name: item.product.name,
          category: item.product.category,
          brand: item.product.brand
        },
        variant: item.variant,
        name: item.name,
        sku: item.sku,
        costPrice: item.costPrice,
        quantity: item.quantity,
        total: item.total
      })),
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt
    }
  });
});

// @desc    Create new purchase order
// @route   POST /api/purchases
// @access  Private (Vendor)
export const createPurchase = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    vendorId,
    supplierId,
    items,
    subtotal,
    tax = 0,
    total,
    deliveryDate,
    notes
  } = req.body;

  // Verify supplier belongs to vendor
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId }
  });

  if (!supplier || supplier.vendorId !== vendorId) {
    return res.status(400).json({
      success: false,
      message: 'Invalid supplier'
    });
  }

  const result = await prisma.$transaction(async (tx) => {
    // Generate purchase number
    const purchaseNumber = generatePurchaseNumber(vendorId);

    // Create purchase
    const purchase = await tx.purchase.create({
      data: {
        vendorId,
        supplierId,
        purchaseNumber,
        subtotal,
        tax,
        total,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        notes
      }
    });

    // Create purchase items
    for (const item of items) {
      await tx.purchaseItem.create({
        data: {
          purchaseId: purchase.id,
          productId: item.productId,
          variantId: item.variantId || null,
          name: item.name,
          sku: item.sku,
          costPrice: item.costPrice,
          quantity: item.quantity,
          total: item.total
        }
      });
    }

    return purchase;
  });

  return res.status(201).json({
    success: true,
    data: {
      id: result.id,
      purchaseNumber: result.purchaseNumber,
      supplierId: result.supplierId,
      subtotal: result.subtotal,
      tax: result.tax,
      total: result.total,
      status: result.status,
      deliveryDate: result.deliveryDate,
      createdAt: result.createdAt
    }
  });
});

// @desc    Update purchase order
// @route   PUT /api/purchases/:id
// @access  Private (Vendor)
export const updatePurchase = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { supplierId, deliveryDate, notes, status } = req.body;

  const existingPurchase = await prisma.purchase.findUnique({
    where: { id }
  });

  if (!existingPurchase) {
    return res.status(404).json({
      success: false,
      message: 'Purchase not found'
    });
  }

  // Check vendor access
  if (existingPurchase.vendorId !== req.user?.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this purchase'
    });
  }

  // Prevent updates to completed purchases
  if (existingPurchase.status === 'COMPLETED') {
    return res.status(400).json({
      success: false,
      message: 'Cannot update completed purchase'
    });
  }

  // Verify supplier if being changed
  if (supplierId && supplierId !== existingPurchase.supplierId) {
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId }
    });

    if (!supplier || supplier.vendorId !== existingPurchase.vendorId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid supplier'
      });
    }
  }

  const purchase = await prisma.purchase.update({
    where: { id },
    data: {
      ...(supplierId && { supplierId }),
      ...(deliveryDate && { deliveryDate: new Date(deliveryDate) }),
      ...(notes !== undefined && { notes }),
      ...(status && { status: status.toUpperCase() })
    },
    include: {
      supplier: {
        select: { name: true }
      }
    }
  });

  return res.status(200).json({
    success: true,
    data: {
      id: purchase.id,
      purchaseNumber: purchase.purchaseNumber,
      supplier: purchase.supplier,
      subtotal: purchase.subtotal,
      tax: purchase.tax,
      total: purchase.total,
      status: purchase.status,
      deliveryDate: purchase.deliveryDate,
      notes: purchase.notes,
      updatedAt: purchase.updatedAt
    }
  });
});

// @desc    Complete purchase order and update inventory
// @route   PUT /api/purchases/:id/complete
// @access  Private (Vendor)
export const completePurchase = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { location = 'Main Store' } = req.body;

  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });

  if (!purchase) {
    return res.status(404).json({
      success: false,
      message: 'Purchase not found'
    });
  }

  // Check vendor access
  if (purchase.vendorId !== req.user?.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to complete this purchase'
    });
  }

  // Check if already completed
  if (purchase.status === 'COMPLETED') {
    return res.status(400).json({
      success: false,
      message: 'Purchase already completed'
    });
  }

  const result = await prisma.$transaction(async (tx) => {
    // Update purchase status
    const updatedPurchase = await tx.purchase.update({
      where: { id },
      data: { status: 'COMPLETED' }
    });

    // Update inventory for each item
    for (const item of purchase.items) {
      // Update or create stock location
      let stockLocation = await tx.productStockLocation.findFirst({
        where: {
          productId: item.productId,
          variantId: item.variantId,
          locationName: location
        }
      });

      if (stockLocation) {
        stockLocation = await tx.productStockLocation.update({
          where: { id: stockLocation.id },
          data: { quantity: { increment: item.quantity } }
        });
      } else {
        stockLocation = await tx.productStockLocation.create({
          data: {
            productId: item.productId,
            variantId: item.variantId,
            locationName: location,
            quantity: item.quantity
          }
        });
      }

      // Create stock movement record
      await tx.stockMovement.create({
        data: {
          vendorId: purchase.vendorId,
          productId: item.productId,
          variantId: item.variantId || null,
          movementType: 'PURCHASE',
          quantity: item.quantity,
          referenceType: 'purchase',
          referenceId: purchase.id,
          referenceNumber: purchase.purchaseNumber,
          locationTo: location,
          notes: `Purchase received from ${purchase.supplierId}`,
          createdBy: req.user!.id
        }
      });

      // Update product cost price if different
      if (item.product.costPrice !== item.costPrice) {
        await tx.product.update({
          where: { id: item.productId },
          data: { costPrice: item.costPrice }
        });
      }

      // Update product total stock
      const totalStock = await tx.productStockLocation.aggregate({
        where: { productId: item.productId },
        _sum: { quantity: true }
      });

      await tx.product.update({
        where: { id: item.productId },
        data: { totalStock: totalStock._sum.quantity || 0 }
      });
    }

    // Create notification for purchase completion
    await tx.notification.create({
      data: {
        vendorId: purchase.vendorId,
        type: 'PURCHASE_RECEIVED',
        title: 'Purchase Order Completed',
        message: `Purchase order ${purchase.purchaseNumber} has been completed and inventory updated.`,
        link: `/purchases/${purchase.id}`
      }
    });

    return updatedPurchase;
  });

  return res.status(200).json({
    success: true,
    data: {
      id: result.id,
      purchaseNumber: result.purchaseNumber,
      status: result.status,
      updatedAt: result.updatedAt
    },
    message: 'Purchase completed and inventory updated successfully'
  });
});

// @desc    Delete purchase order
// @route   DELETE /api/purchases/:id
// @access  Private (Vendor)
export const deletePurchase = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const purchase = await prisma.purchase.findUnique({
    where: { id }
  });

  if (!purchase) {
    return res.status(404).json({
      success: false,
      message: 'Purchase not found'
    });
  }

  // Check vendor access
  if (purchase.vendorId !== req.user?.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this purchase'
    });
  }

  // Prevent deletion of completed purchases
  if (purchase.status === 'COMPLETED') {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete completed purchase orders'
    });
  }

  await prisma.purchase.delete({
    where: { id }
  });

  return res.status(200).json({
    success: true,
    message: 'Purchase order deleted successfully'
  });
});
