export interface User {
  id: string;
  email: string;
  role: 'superadmin' | 'vendor' | 'cashier';
  vendorId?: string;
  name: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Vendor {
  id: string;
  name:string;
  email: string;
  phone: string;
  address: string;
  businessType: string;
  subscriptionPlan: 'trial' | 'basic' | 'standard' | 'premium';
  subscriptionStatus: 'trialing' | 'active' | 'inactive' | 'suspended';
  subscriptionExpiry: Date;
  isApproved: boolean;
  settings: VendorSettings;
  createdAt: Date;
}

export interface VendorSettings {
  taxRate: number;
  currency: string;
  timezone: string;
  receiptHeader: string;
  receiptFooter: string;
  loyaltyProgram: LoyaltySettings;
  notifications: NotificationSettings;
}

export interface LoyaltySettings {
  enabled: boolean;
  pointsPerDollar: number;
  redemptionRate: number; // e.g., 0.01 means 1 point = $0.01
  minimumPoints: number;
}

export interface NotificationSettings {
  lowStockAlert: boolean;
  lowStockThreshold: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  dailyReports: boolean;
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  variants?: ProductVariant[];
  images: string[];
  isActive: boolean;
  expiryDate?: Date;
  trackExpiry: boolean;
  trackSerial: boolean;
  serialNumbers?: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g., "Size", "Color"
  type: 'size' | 'color' | 'style' | 'other';
  value: string; // e.g., "M", "Red"
  price: number; // Can be an override or modifier
  stock: number;
  sku: string;
  barcode: string;
}

export interface Customer {
  id: string;
  vendorId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
  loyaltyPoints: number;
  totalSpent: number;
  visitCount: number;
  lastVisit?: Date;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
}

export interface Sale {
  id: string;
  vendorId: string;
  cashierId: string;
  terminalId: string;
  customerId?: string;
  receiptNumber: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paid: number;
  change: number;
  paymentMethod: 'cash' | 'card' | 'mobile' | 'loyalty';
  status: 'completed' | 'refunded' | 'partial_refund';
  refundAmount?: number;
  loyaltyPointsEarned: number;
  loyaltyPointsUsed: number;
  notes?: string;
  createdAt: Date;
}

export interface SaleItem {
  productId: string;
  variantId?: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  discount: number;
  total: number;
}

export interface StockMovement {
  id: string;
  vendorId: string;
  productId: string;
  variantId?: string;
  type: 'sale' | 'purchase' | 'adjustment' | 'transfer' | 'return';
  quantity: number; // Can be negative for sales/adjustments
  reference: string; // e.g., Sale ID, Purchase Order #
  notes?: string;
  createdAt: Date;
  createdBy: string; // User ID
}

export interface Supplier {
  id: string;
  vendorId: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  paymentTerms: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Purchase {
  id: string;
  vendorId: string;
  supplierId: string;
  purchaseNumber: string;
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  deliveryDate?: Date;
  notes?: string;
  createdAt: Date;
}

export interface PurchaseItem {
  productId: string;
  variantId?: string;
  name: string;
  sku: string;
  costPrice: number;
  quantity: number;
  total: number;
}

export interface AuditLog {
  id: string;
  vendorId: string;
  userId: string;
  action: string; // e.g., 'CREATE_PRODUCT', 'UPDATE_SALE'
  resource: string; // e.g., 'Product', 'Sale'
  resourceId: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  vendorId: string;
  userId?: string; // For user-specific notifications
  type: 'low_stock' | 'sale' | 'system' | 'subscription';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Report {
  id: string;
  vendorId: string;
  type: 'sales' | 'inventory' | 'customer' | 'profit';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  startDate: Date;
  endDate: Date;
  data: any;
  generatedAt: Date;
  generatedBy: string;
}

export interface SupportTicket {
    id: string;
    vendorId: string;
    vendorName: string;
    subject: string;
    description: string;
    status: 'open' | 'in_progress' | 'closed';
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
    updatedAt: Date;
}

export interface StockTake {
    id: string;
    vendorId: string;
    status: 'in_progress' | 'completed' | 'cancelled';
    items: StockTakeItem[];
    createdAt: Date;
    completedAt?: Date;
    createdBy: string; // User ID
    notes?: string;
}

export interface StockTakeItem {
    productId: string;
    productName: string;
    sku: string;
    expected: number;
    counted: number;
    variance: number;
}
