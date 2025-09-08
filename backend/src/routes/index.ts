import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import productRoutes from './products';
import saleRoutes from './sales';
import customerRoutes from './customers';
import supplierRoutes from './suppliers';
import purchaseRoutes from './purchases';
import stockRoutes from './stock';
import notificationRoutes from './notifications';
import reportRoutes from './reports';
import vendorRoutes from './vendor';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Flux POS API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/sales', saleRoutes);
router.use('/customers', customerRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/stock', stockRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);
router.use('/vendors', vendorRoutes);

export default router;
