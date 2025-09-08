import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../server';

// @desc    Get all suppliers for vendor
// @route   GET /api/suppliers
// @access  Private (Vendor)
export const getSuppliers = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<any> => {
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
      { contactPerson: { contains: search as string } },
      { email: { contains: search as string } }
    ];
  }

  const suppliers = await prisma.supplier.findMany({
    where,
    include: {
      _count: {
        select: {
          purchases: true
        }
      }
    },
    orderBy: { name: 'asc' },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
  });

  const total = await prisma.supplier.count({ where });

  return res.status(200).json({
    success: true,
    data: suppliers.map(supplier => ({
      id: supplier.id,
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      paymentTerms: supplier.paymentTerms,
      isActive: supplier.isActive,
      purchaseCount: supplier._count.purchases,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
// @access  Private (Vendor)
export const getSupplier = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      purchases: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          purchaseNumber: true,
          total: true,
          status: true,
          createdAt: true
        }
      },
      _count: {
        select: {
          purchases: true
        }
      }
    }
  });

  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: 'Supplier not found'
    });
  }

  // Check vendor access
  if (supplier.vendorId !== req.user?.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this supplier'
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      id: supplier.id,
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      paymentTerms: supplier.paymentTerms,
      isActive: supplier.isActive,
      recentPurchases: supplier.purchases,
      totalPurchases: supplier._count.purchases,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt
    }
  });
});

// @desc    Create new supplier
// @route   POST /api/suppliers
// @access  Private (Vendor)
export const createSupplier = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { vendorId, name, contactPerson, email, phone, address, paymentTerms } = req.body;

  const supplier = await prisma.supplier.create({
    data: {
      vendorId,
      name,
      contactPerson,
      email,
      phone,
      address,
      paymentTerms
    }
  });

  return res.status(201).json({
    success: true,
    data: {
      id: supplier.id,
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      paymentTerms: supplier.paymentTerms,
      isActive: supplier.isActive,
      createdAt: supplier.createdAt
    }
  });
});

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private (Vendor)
export const updateSupplier = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, contactPerson, email, phone, address, paymentTerms, isActive } = req.body;

  const existingSupplier = await prisma.supplier.findUnique({
    where: { id }
  });

  if (!existingSupplier) {
    return res.status(404).json({
      success: false,
      message: 'Supplier not found'
    });
  }

  // Check vendor access
  if (existingSupplier.vendorId !== req.user?.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this supplier'
    });
  }

  const supplier = await prisma.supplier.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(contactPerson !== undefined && { contactPerson }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(paymentTerms !== undefined && { paymentTerms }),
      ...(typeof isActive === 'boolean' && { isActive })
    }
  });

  return res.status(200).json({
    success: true,
    data: {
      id: supplier.id,
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      paymentTerms: supplier.paymentTerms,
      isActive: supplier.isActive,
      updatedAt: supplier.updatedAt
    }
  });
});

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private (Vendor)
export const deleteSupplier = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      purchases: true
    }
  });

  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: 'Supplier not found'
    });
  }

  // Check vendor access
  if (supplier.vendorId !== req.user?.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this supplier'
    });
  }

  // Check if supplier has purchases
  if (supplier.purchases.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete supplier with existing purchases. Consider deactivating instead.'
    });
  }

  await prisma.supplier.delete({
    where: { id }
  });

  return res.status(200).json({
    success: true,
    message: 'Supplier deleted successfully'
  });
});
