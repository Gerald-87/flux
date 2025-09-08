import { Request, Response } from 'express';
// import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../server';

// const prisma = new PrismaClient();

// @desc    Get all products for vendor
// @route   GET /api/products
// @access  Private (Vendor, Cashier)
export const getProducts = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const vendorId = req.user?.vendorId;
  const { category, search, page = 1, limit = 20, isActive = 'true' } = req.query;

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

  // Filter by category
  if (category) {
    where.category = category;
  }

  // Search functionality
  if (search) {
    where.OR = [
      { name: { contains: search as string } },
      { sku: { contains: search as string } },
      { barcode: { contains: search as string } }
    ];
  }

  // For cashiers, only show assigned products
  if (req.user?.role === 'cashier') {
    const assignments = await prisma.cashierProductAssignment.findMany({
      where: { userId: req.user.id },
      select: { productId: true }
    });
    
    if (assignments.length > 0) {
      where.id = { in: assignments.map(a => a.productId) };
    } else {
      // No assignments = no products visible
      where.id = { in: [] };
    }
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      variants: {
        where: { isActive: true }
      },
      stockLocations: true,
      _count: {
        select: {
          saleItems: true,
          purchaseItems: true
        }
      }
    },
    orderBy: { name: 'asc' },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
  });

  const total = await prisma.product.count({ where });

  return res.status(200).json({
    success: true,
    data: products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      sku: product.sku,
      barcode: product.barcode,
      category: product.category,
      brand: product.brand,
      price: product.price,
      costPrice: product.costPrice,
      totalStock: product.totalStock,
      minStock: product.minStock,
      maxStock: product.maxStock,
      unit: product.unit,
      images: product.images,
      isActive: product.isActive,
      expiryDate: product.expiryDate,
      trackExpiry: product.trackExpiry,
      trackSerial: product.trackSerial,
      tags: product.tags,
      variants: product.variants,
      stockLocations: product.stockLocations,
      salesCount: product._count.saleItems,
      purchaseCount: product._count.purchaseItems,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// @desc    Get low stock products
// @route   GET /api/products/low-stock
// @access  Private (Vendor)
export const getLowStockProducts = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const vendorId = req.user?.vendorId;

  if (!vendorId) {
    return res.status(400).json({
      success: false,
      message: 'Vendor ID is required'
    });
  }

  // Get vendor settings for low stock threshold
  const vendorSettings = await prisma.vendorSettings.findUnique({
    where: { vendorId }
  });

  const lowStockThreshold = vendorSettings?.lowStockThreshold || 10;

  const products = await prisma.product.findMany({
    where: {
      vendorId,
      isActive: true,
      OR: [
        { totalStock: { lte: lowStockThreshold } },
        { totalStock: { lte: prisma.product.fields.minStock } }
      ]
    },
    include: {
      stockLocations: true
    },
    orderBy: { totalStock: 'asc' }
  });

  return res.status(200).json({
    success: true,
    data: products.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      totalStock: product.totalStock,
      minStock: product.minStock,
      lowStockThreshold,
      stockLocations: product.stockLocations,
      createdAt: product.createdAt
    }))
  });
});

// @desc    Get products by location
// @route   GET /api/products/location/:location
// @access  Private (Vendor, Cashier)
export const getProductsByLocation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { vendorId } = req.body;
  const { location } = req.params;

  const stockLocations = await prisma.productStockLocation.findMany({
    where: {
      locationName: location,
      product: { vendorId }
    },
    include: {
      product: {
        include: {
          variants: true
        }
      },
      variant: true
    }
  });

  res.status(200).json({
    success: true,
    data: stockLocations.map(stock => ({
      id: stock.id,
      productId: stock.productId,
      variantId: stock.variantId,
      locationName: stock.locationName,
      quantity: stock.quantity,
      reservedQuantity: stock.reservedQuantity,
      product: {
        id: stock.product.id,
        name: stock.product.name,
        sku: stock.product.sku,
        price: stock.product.price,
        category: stock.product.category,
        brand: stock.product.brand,
        unit: stock.product.unit,
        isActive: stock.product.isActive
      },
      variant: stock.variant ? {
        id: stock.variant.id,
        name: stock.variant.name,
        value: stock.variant.value,
        sku: stock.variant.sku,
        priceModifier: stock.variant.priceModifier
      } : null
    }))
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private (Vendor, Cashier)
export const getProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: {
        where: { isActive: true }
      },
      stockLocations: true,
      stockMovements: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          creator: {
            select: { name: true }
          }
        }
      },
      _count: {
        select: {
          saleItems: true,
          purchaseItems: true
        }
      }
    }
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Check vendor access
  if (req.user?.role !== 'superadmin' && product.vendorId !== req.user?.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this product'
    });
  }

  // For cashiers, check if product is assigned
  if (req.user?.role === 'cashier') {
    const assignment = await prisma.cashierProductAssignment.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: product.id
        }
      }
    });

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: 'Product not assigned to this cashier'
      });
    }
  }

  return res.status(200).json({
    success: true,
    data: {
      id: product.id,
      name: product.name,
      description: product.description,
      sku: product.sku,
      barcode: product.barcode,
      category: product.category,
      brand: product.brand,
      price: product.price,
      costPrice: product.costPrice,
      totalStock: product.totalStock,
      minStock: product.minStock,
      maxStock: product.maxStock,
      unit: product.unit,
      images: product.images,
      isActive: product.isActive,
      expiryDate: product.expiryDate,
      trackExpiry: product.trackExpiry,
      trackSerial: product.trackSerial,
      tags: product.tags,
      variants: product.variants,
      stockLocations: product.stockLocations,
      recentMovements: product.stockMovements,
      salesCount: product._count.saleItems,
      purchaseCount: product._count.purchaseItems,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }
  });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Vendor)
export const createProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { 
    vendorId, 
    name, 
    description, 
    sku, 
    barcode, 
    category, 
    brand, 
    price, 
    costPrice,
    minStock = 10,
    maxStock = 1000,
    unit = 'piece',
    images,
    trackExpiry = false,
    trackSerial = false,
    tags,
    expiryDate,
    initialStock = 0,
    location = 'Main Store'
  } = req.body;

  // Check if SKU already exists for this vendor
  const existingProduct = await prisma.product.findUnique({
    where: {
      vendorId_sku: {
        vendorId,
        sku
      }
    }
  });

  if (existingProduct) {
    return res.status(400).json({
      success: false,
      message: 'Product with this SKU already exists'
    });
  }

  const product = await prisma.$transaction(async (tx) => {
    // Create product
    const newProduct = await tx.product.create({
      data: {
        vendorId,
        name,
        description,
        sku,
        barcode,
        category,
        brand,
        price,
        costPrice,
        minStock,
        maxStock,
        unit,
        images: images || [],
        trackExpiry,
        trackSerial,
        tags: tags || [],
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        totalStock: initialStock
      }
    });

    // Create initial stock location if stock provided
    if (initialStock > 0) {
      await tx.productStockLocation.create({
        data: {
          productId: newProduct.id,
          locationName: location,
          quantity: initialStock
        }
      });

      // Create stock movement record
      await tx.stockMovement.create({
        data: {
          vendorId,
          productId: newProduct.id,
          movementType: 'ADJUSTMENT',
          quantity: initialStock,
          referenceType: 'initial_stock',
          locationTo: location,
          notes: 'Initial stock entry',
          createdBy: req.user!.id
        }
      });
    }

    return newProduct;
  });

  return res.status(201).json({
    success: true,
    data: {
      id: product.id,
      name: product.name,
      description: product.description,
      sku: product.sku,
      barcode: product.barcode,
      category: product.category,
      brand: product.brand,
      price: product.price,
      costPrice: product.costPrice,
      totalStock: product.totalStock,
      minStock: product.minStock,
      maxStock: product.maxStock,
      unit: product.unit,
      images: product.images,
      isActive: product.isActive,
      createdAt: product.createdAt
    }
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Vendor)
export const updateProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const existingProduct = await prisma.product.findUnique({
    where: { id }
  });

  if (!existingProduct) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Check vendor access
  if (existingProduct.vendorId !== req.user?.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this product'
    });
  }

  // Remove vendorId from update data to prevent modification
  delete updateData.vendorId;

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      variants: true,
      stockLocations: true
    }
  });

  return res.status(200).json({
    success: true,
    data: {
      id: product.id,
      name: product.name,
      description: product.description,
      sku: product.sku,
      barcode: product.barcode,
      category: product.category,
      brand: product.brand,
      price: product.price,
      costPrice: product.costPrice,
      totalStock: product.totalStock,
      minStock: product.minStock,
      maxStock: product.maxStock,
      unit: product.unit,
      images: product.images,
      isActive: product.isActive,
      variants: product.variants,
      stockLocations: product.stockLocations,
      updatedAt: product.updatedAt
    }
  });
});

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private (Vendor)
export const updateProductStock = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { location, quantity, operation, notes } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required'
    });
  }

  const product = await prisma.product.findUnique({
    where: { id }
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Check vendor access
  if (product.vendorId !== req.user?.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this product'
    });
  }

  const result = await prisma.$transaction(async (tx) => {
    // Get or create stock location
    let stockLocation = await tx.productStockLocation.findFirst({
      where: {
        productId: id,
        variantId: null,
        locationName: location
      }
    });

    let newQuantity = quantity;
    let movementQuantity = quantity;

    if (operation === 'add') {
      newQuantity = (stockLocation?.quantity || 0) + quantity;
      movementQuantity = quantity;
    } else if (operation === 'subtract') {
      newQuantity = Math.max(0, (stockLocation?.quantity || 0) - quantity);
      movementQuantity = -quantity;
    }

    // Update or create stock location
    if (stockLocation) {
      stockLocation = await tx.productStockLocation.update({
        where: { id: stockLocation.id },
        data: { quantity: newQuantity }
      });
    } else {
      stockLocation = await tx.productStockLocation.create({
        data: {
          productId: id,
          locationName: location,
          quantity: newQuantity
        }
      });
    }

    // Create stock movement record
    await tx.stockMovement.create({
      data: {
        vendorId: product.vendorId,
        productId: id,
        movementType: 'ADJUSTMENT',
        quantity: movementQuantity,
        referenceType: 'manual_adjustment',
        locationTo: location,
        notes: notes || `Stock ${operation}: ${quantity}`,
        createdBy: req.user!.id
      }
    });

    // Update product total stock
    const totalStock = await tx.productStockLocation.aggregate({
      where: { productId: id },
      _sum: { quantity: true }
    });

    await tx.product.update({
      where: { id },
      data: { totalStock: totalStock._sum.quantity || 0 }
    });

    return stockLocation;
  });

  return res.status(200).json({
    success: true,
    data: {
      id: result.id,
      productId: result.productId,
      locationName: result.locationName,
      quantity: result.quantity,
      updatedAt: result.updatedAt
    }
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Vendor)
export const deleteProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      saleItems: true,
      purchaseItems: true
    }
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Check vendor access
  if (product.vendorId !== req.user?.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this product'
    });
  }

  // Check if product has been used in sales or purchases
  if (product.saleItems.length > 0 || product.purchaseItems.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete product that has been used in sales or purchases. Consider deactivating instead.'
    });
  }

  await prisma.product.delete({
    where: { id }
  });

  return res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});
