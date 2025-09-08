import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  getVendors,
  getVendor,
  createVendor,
  updateVendorStatus,
  deleteVendor,
  getSystemAnalytics,
  getSupportTickets,
  createSupportTicket,
  updateSupportTicket,
  deleteSupportTicket,
  getPricingPlans,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
  getCashiers
} from '../controllers/vendorController';
import { createCashier } from '../controllers/cashierController';

const router = Router();

// All routes require SuperAdmin role
router.use(protect, authorize('SUPERADMIN'));

// Analytics routes (must come before vendor management routes to avoid conflicts)
router.get('/analytics', getSystemAnalytics);

// Cashiers route (must come before /:id routes to avoid conflicts)
router.get('/cashiers', getCashiers);

// Pricing plan routes (must come before /:id routes to avoid conflicts)
router.route('/pricing-plans')
  .get(getPricingPlans)
  .post(createPricingPlan);

router.route('/pricing-plans/:id')
  .put(updatePricingPlan)
  .delete(deletePricingPlan);

// Support ticket routes
router.route('/support-tickets')
  .get(getSupportTickets)
  .post(createSupportTicket);

router.route('/support-tickets/:id')
  .put(updateSupportTicket)
  .delete(deleteSupportTicket);

// Vendor management routes (must come after specific routes)
router.route('/')
  .get(getVendors)
  .post(createVendor);

router.route('/:id')
  .get(getVendor)
  .delete(deleteVendor);

router.put('/:id/status', updateVendorStatus);
router.post('/:id/cashiers', createCashier);

export default router;
