import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// @desc    Get stock movements for vendor
// @route   GET /api/stock/movements
// @access  Private (Vendor)
export const getStockMovements = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { vendorId } = req.body;
  const { 
    productId, 
    movementType, 
    location, 
    startDate, 
    endDate, 
    page = 1, 
    limit = 20 
  } = req.query;

  const where: any = { vendorId };

  // Filter by product
  if (productId) {
    where.productId = productId;
  }

  // Filter by movement type
  if (movementType) {
    where.movementType = movementType.toString().toUpperCase();
  }

  // Filter by location
  if (location) {
    where.OR = [
      { locationFrom: location },
      { locationTo: location }
    ];
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

  const movements = await prisma.stockMovement.findMany({
    where,
    include: {
      product: {
        select: { name: true, sku: true }
      },
      variant: {
        select: { name: true, value: true }
      },
      creator: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
  });

  const total = await prisma.stockMovement.count({ where });

  res.status(200).json({
    success: true,
    data: movements.map(movement => ({
      id: movement.id,
      product: {
        name: movement.product.name,
        sku: movement.product.sku
      },
      variant: movement.variant,
      movementType: movement.movementType,
      quantity: movement.quantity,
      referenceType: movement.referenceType,
      referenceNumber: movement.referenceNumber,
      locationFrom: movement.locationFrom,
      locationTo: movement.locationTo,
      notes: movement.notes,
      createdBy: movement.creator.name,
      createdAt: movement.createdAt
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// @desc    Create stock movement (adjustment/transfer)
// @route   POST /api/stock/movements
// @access  Private (Vendor)
export const createStockMovement = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    vendorId,
    productId,
    variantId,
    movementType,
    quantity,
    locationFrom,
    locationTo,
    notes
  } = req.body;

  // Validate movement type
  const validTypes = ['ADJUSTMENT', 'TRANSFER'];
  if (!validTypes.includes(movementType.toUpperCase())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid movement type'
    });
  }

  // Validate product exists and belongs to vendor
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product || product.vendorId !== vendorId) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product'
    });
  }

  const result = await prisma.$transaction(async (tx) => {
    // For transfers, validate source location has enough stock
    if (movementType.toUpperCase() === 'TRANSFER' && locationFrom) {
      const sourceStock = await tx.productStockLocation.findUnique({
        where: {
          productId_variantId_locationName: {
            productId,
            variantId: variantId || null,
            locationName: locationFrom
          }
        }
      });

      if (!sourceStock || sourceStock.quantity < Math.abs(quantity)) {
        throw new Error(`Insufficient stock in ${locationFrom}. Available: ${sourceStock?.quantity || 0}`);
      }

      // Reduce stock from source location
      await tx.productStockLocation.update({
        where: { id: sourceStock.id },
        data: { quantity: sourceStock.quantity - Math.abs(quantity) }
      });
    }

    // For adjustments or transfers to destination, update target location
    if (movementType.toUpperCase() === 'ADJUSTMENT' || locationTo) {
      const targetLocation = locationTo || locationFrom;
      
      if (targetLocation) {
        await tx.productStockLocation.upsert({
          where: {
            productId_variantId_locationName: {
              productId,
              variantId: variantId || null,
              locationName: targetLocation
            }
          },
          update: {
            quantity: movementType.toUpperCase() === 'ADJUSTMENT' 
              ? { increment: quantity }
              : { increment: Math.abs(quantity) }
          },
          create: {
            productId,
            variantId: variantId || null,
            locationName: targetLocation,
            quantity: Math.abs(quantity)
          }
        });
      }
    }

    // Create stock movement record
    const movement = await tx.stockMovement.create({
      data: {
        vendorId,
        productId,
        variantId: variantId || null,
        movementType: movementType.toUpperCase(),
        quantity,
        referenceType: 'manual_' + movementType.toLowerCase(),
        locationFrom,
        locationTo,
        notes,
        createdBy: req.user!.id
      }
    });

    // Update product total stock
    const totalStock = await tx.productStockLocation.aggregate({
      where: { productId },
      _sum: { quantity: true }
    });

    await tx.product.update({
      where: { id: productId },
      data: { totalStock: totalStock._sum.quantity || 0 }
    });

    return movement;
  });

  return res.status(201).json({
    success: true,
    data: {
      id: result.id,
      movementType: result.movementType,
      quantity: result.quantity,
      locationFrom: result.locationFrom,
      locationTo: result.locationTo,
      createdAt: result.createdAt
    }
  });
});

// @desc    Get stock takes for vendor
// @route   GET /api/stock/takes
// @access  Private (Vendor)
export const getStockTakes = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { vendorId } = req.body;
  const { location, status, page = 1, limit = 20 } = req.query;

  const where: any = { vendorId };

  // Filter by location
  if (location) {
    where.location = location;
  }

  // Filter by status
  if (status) {
    where.status = status.toString().toUpperCase();
  }

  const stockTakes = await prisma.stockTake.findMany({
    where,
    include: {
      creator: {
        select: { name: true }
      },
      items: {
        include: {
          product: {
            select: { name: true, sku: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
  });

  const total = await prisma.stockTake.count({ where });

  res.status(200).json({
    success: true,
    data: stockTakes.map(stockTake => ({
      id: stockTake.id,
      location: stockTake.location,
      status: stockTake.status,
      notes: stockTake.notes,
      createdBy: stockTake.creator.name,
      completedAt: stockTake.completedAt,
      itemCount: stockTake.items.length,
      totalVariance: stockTake.items.reduce((sum, item) => 
        sum + (item.countedQuantity - item.expectedQuantity), 0
      ),
      createdAt: stockTake.createdAt,
      updatedAt: stockTake.updatedAt
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// @desc    Create new stock take
// @route   POST /api/stock/takes
// @access  Private (Vendor)
export const createStockTake = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { vendorId, location, notes } = req.body;

  // Get all products with stock in the specified location
  const stockLocations = await prisma.productStockLocation.findMany({
    where: {
      locationName: location,
      product: { vendorId },
      quantity: { gt: 0 }
    },
    include: {
      product: {
        select: { name: true, sku: true }
      },
      variant: {
        select: { name: true, value: true, sku: true }
      }
    }
  });

  const result = await prisma.$transaction(async (tx) => {
    // Create stock take
    const stockTake = await tx.stockTake.create({
      data: {
        vendorId,
        location,
        notes,
        createdBy: req.user!.id
      }
    });

    // Create stock take items for all products in location
    for (const stockLocation of stockLocations) {
      await tx.stockTakeItem.create({
        data: {
          stockTakeId: stockTake.id,
          productId: stockLocation.productId,
          variantId: stockLocation.variantId,
          productName: stockLocation.variant 
            ? `${stockLocation.product.name} (${stockLocation.variant.name}: ${stockLocation.variant.value})`
            : stockLocation.product.name,
          sku: stockLocation.variant?.sku || stockLocation.product.sku,
          expectedQuantity: stockLocation.quantity,
          countedQuantity: 0 // To be updated during counting
        }
      });
    }

    return stockTake;
  });

  res.status(201).json({
    success: true,
    data: {
      id: result.id,
      location: result.location,
      status: result.status,
      itemCount: stockLocations.length,
      createdAt: result.createdAt
    }
  });
});

// @desc    Update stock take items
// @route   PUT /api/stock/takes/:id
// @access  Private (Vendor)
export const updateStockTake = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { items } = req.body;

  const stockTake = await prisma.stockTake.findUnique({
    where: { id }
  });

  if (!stockTake) {
    return res.status(404).json({
      success: false,
      message: 'Stock take not found'
    });
  }

  // Check vendor access
  if (stockTake.vendorId !== req.user?.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this stock take'
    });
  }

  // Check if stock take is still in progress
  if (stockTake.status !== 'IN_PROGRESS') {
    return res.status(400).json({
      success: false,
      message: 'Can only update stock takes that are in progress'
    });
  }

  const result = await prisma.$transaction(async (tx) => {
    // Update stock take items
    for (const item of items) {
      await tx.stockTakeItem.updateMany({
        where: {
          stockTakeId: id,
          productId: item.productId,
          variantId: item.variantId || null
        },
        data: {
          countedQuantity: item.countedQuantity,
          notes: item.notes
        }
      });
    }

    // Get updated stock take with items
    const updatedStockTake = await tx.stockTake.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, sku: true }
            }
          }
        }
      }
    });

    return updatedStockTake;
  });

  return res.status(200).json({
    success: true,
    data: {
      id: result!.id,
      location: result!.location,
      status: result!.status,
      items: result!.items.map(item => ({
        id: item.id,
        product: item.product,
        productName: item.productName,
        sku: item.sku,
        expectedQuantity: item.expectedQuantity,
        countedQuantity: item.countedQuantity,
        variance: item.countedQuantity - item.expectedQuantity,
        notes: item.notes
      })),
      updatedAt: result!.updatedAt
    }
  });
});

// @desc    Complete stock take and apply adjustments
// @route   PUT /api/stock/takes/:id/complete
// @access  Private (Vendor)
export const completeStockTake = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const stockTake = await prisma.stockTake.findUnique({
    where: { id },
    include: {
      items: true
    }
  });

  if (!stockTake) {
    return res.status(404).json({
      success: false,
      message: 'Stock take not found'
    });
  }

  // Check vendor access
  if (stockTake.vendorId !== req.user?.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to complete this stock take'
    });
  }

  // Check if stock take is in progress
  if (stockTake.status !== 'IN_PROGRESS') {
    return res.status(400).json({
      success: false,
      message: 'Stock take is not in progress'
    });
  }

  const result = await prisma.$transaction(async (tx) => {
    // Apply adjustments for items with variances
    for (const item of stockTake.items) {
      const variance = item.countedQuantity - item.expectedQuantity;
      
      if (variance !== 0) {
        // Update stock location
        await tx.productStockLocation.updateMany({
          where: {
            productId: item.productId,
            variantId: item.variantId,
            locationName: stockTake.location
          },
          data: {
            quantity: item.countedQuantity
          }
        });

        // Create stock movement record
        await tx.stockMovement.create({
          data: {
            vendorId: stockTake.vendorId,
            productId: item.productId,
            variantId: item.variantId,
            movementType: 'ADJUSTMENT',
            quantity: variance,
            referenceType: 'stock_take',
            referenceId: stockTake.id,
            locationTo: stockTake.location,
            notes: `Stock take adjustment: ${variance > 0 ? 'found' : 'missing'} ${Math.abs(variance)} units`,
            createdBy: req.user!.id
          }
        });

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
    }

    // Complete stock take
    const completedStockTake = await tx.stockTake.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

    // Create notification
    await tx.notification.create({
      data: {
        vendorId: stockTake.vendorId,
        type: 'STOCK_TAKE_COMPLETE',
        title: 'Stock Take Completed',
        message: `Stock take for ${stockTake.location} has been completed with ${stockTake.items.filter(item => item.countedQuantity !== item.expectedQuantity).length} adjustments.`,
        link: `/stock/takes/${stockTake.id}`
      }
    });

    return completedStockTake;
  });

  return res.status(200).json({
    success: true,
    data: {
      id: result.id,
      location: result.location,
      status: result.status,
      completedAt: result.completedAt,
      updatedAt: result.updatedAt
    },
    message: 'Stock take completed and adjustments applied'
  });
});
