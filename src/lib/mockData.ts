import { faker } from '@faker-js/faker';
import { Sale, Product, Customer, Supplier, Purchase, StockMovement, User, SaleItem, Vendor, SupportTicket, StockTake } from '../types';

export const createMockProducts = (count: number): Product[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: faker.string.uuid(),
    vendorId: 'vendor1',
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
    barcode: faker.string.numeric(12),
    category: faker.commerce.department(),
    brand: faker.company.name(),
    price: parseFloat(faker.commerce.price()),
    costPrice: parseFloat(faker.commerce.price({ min: 10, max: 200 })),
    stock: faker.number.int({ min: 0, max: 100 }),
    minStock: 10,
    maxStock: 100,
    unit: 'piece',
    images: [faker.image.urlLoremFlickr({ category: 'technics' })],
    isActive: faker.datatype.boolean(),
    trackExpiry: false,
    trackSerial: false,
    tags: [faker.commerce.productAdjective(), faker.commerce.productMaterial()],
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }));
};

export const createMockCustomers = (count: number): Customer[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    vendorId: 'vendor1',
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    loyaltyPoints: faker.number.int({ min: 0, max: 1000 }),
    totalSpent: faker.number.float({ min: 100, max: 5000, precision: 2 }),
    visitCount: faker.number.int({ min: 1, max: 50 }),
    lastVisit: faker.date.recent(),
    isActive: faker.datatype.boolean(),
    createdAt: faker.date.past(),
  }));
};

export const createMockCashiers = (count: number): User[] => {
    return Array.from({ length: count }, () => ({
        id: faker.string.uuid(),
        email: faker.internet.email(),
        role: 'cashier',
        vendorId: 'vendor1',
        name: faker.person.fullName(),
        avatar: faker.image.avatar(),
        isActive: faker.datatype.boolean(),
        createdAt: faker.date.past(),
        lastLogin: faker.date.recent(),
    }));
};

const mockCashiers = createMockCashiers(10);

export const createMockSales = (count: number, products: Product[], customers: Customer[]): Sale[] => {
  return Array.from({ length: count }, () => {
    const itemsCount = faker.number.int({ min: 1, max: 5 });
    const items: SaleItem[] = Array.from({ length: itemsCount }, () => {
      const product = faker.helpers.arrayElement(products);
      const quantity = faker.number.int({ min: 1, max: 3 });
      return {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity: quantity,
        discount: 0,
        total: product.price * quantity,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    return {
      id: faker.string.uuid(),
      receiptNumber: `RCP-${faker.string.numeric(8)}`,
      vendorId: 'vendor1',
      cashierId: faker.helpers.arrayElement(mockCashiers).id,
      terminalId: `T-${faker.number.int({ min: 1, max: 3 })}`,
      customerId: faker.helpers.arrayElement(customers).id,
      items,
      subtotal,
      tax,
      discount: 0,
      total,
      paid: total,
      change: 0,
      paymentMethod: faker.helpers.arrayElement(['cash', 'card', 'mobile']),
      status: 'completed',
      loyaltyPointsEarned: Math.floor(total / 10),
      loyaltyPointsUsed: 0,
      createdAt: faker.date.recent({ days: 30 }),
    };
  });
};

export const createMockSuppliers = (count: number): Supplier[] => {
    return Array.from({ length: count }, () => ({
        id: faker.string.uuid(),
        vendorId: 'vendor1',
        name: faker.company.name(),
        contactPerson: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        paymentTerms: faker.helpers.arrayElement(['Net 30', 'Net 60', 'On Delivery']),
        isActive: faker.datatype.boolean(),
        createdAt: faker.date.past(),
    }));
};

export const createMockPurchases = (count: number, products: Product[], suppliers: Supplier[]): Purchase[] => {
    return Array.from({ length: count }, () => {
        const itemsCount = faker.number.int({ min: 2, max: 10 });
        const items = Array.from({ length: itemsCount }, () => {
            const product = faker.helpers.arrayElement(products);
            const quantity = faker.number.int({ min: 10, max: 50 });
            return {
                productId: product.id,
                name: product.name,
                sku: product.sku,
                costPrice: product.costPrice,
                quantity: quantity,
                total: product.costPrice * quantity,
            };
        });
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const tax = subtotal * 0.08;
        return {
            id: faker.string.uuid(),
            vendorId: 'vendor1',
            supplierId: faker.helpers.arrayElement(suppliers).id,
            purchaseNumber: `PO-${faker.string.numeric(6)}`,
            items,
            subtotal,
            tax,
            total: subtotal + tax,
            status: faker.helpers.arrayElement(['pending', 'completed', 'cancelled']),
            deliveryDate: faker.date.future(),
            createdAt: faker.date.past({ years: 1 }),
        };
    });
};

export const createMockStockMovements = (count: number, products: Product[]): StockMovement[] => {
    return Array.from({ length: count }, () => {
        const product = faker.helpers.arrayElement(products);
        return {
            id: faker.string.uuid(),
            vendorId: 'vendor1',
            productId: product.id,
            type: faker.helpers.arrayElement(['sale', 'purchase', 'adjustment', 'transfer', 'return']),
            quantity: faker.number.int({ min: -50, max: 50 }),
            reference: `REF-${faker.string.alphanumeric(8)}`,
            notes: faker.lorem.sentence(),
            createdAt: faker.date.recent({ days: 90 }),
            createdBy: 'user1',
        };
    });
};

export const createMockVendors = (count: number): Vendor[] => {
    return Array.from({ length: count }, () => ({
        id: faker.string.uuid(),
        name: faker.company.name(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        businessType: faker.commerce.department(),
        subscriptionPlan: faker.helpers.arrayElement(['basic', 'standard', 'premium', 'trial']),
        subscriptionStatus: faker.helpers.arrayElement(['active', 'inactive', 'suspended', 'trialing']),
        subscriptionExpiry: faker.date.future(),
        isApproved: faker.datatype.boolean(0.8), // 80% chance of being approved
        settings: {
            taxRate: 0.1,
            currency: 'USD',
            timezone: 'UTC',
            receiptHeader: 'Thank you for your purchase!',
            receiptFooter: 'Please come again.',
            loyaltyProgram: { enabled: true, pointsPerDollar: 1, redemptionRate: 0.01, minimumPoints: 100 },
            notifications: { lowStockAlert: true, lowStockThreshold: 10, emailNotifications: true, smsNotifications: false, dailyReports: true },
        },
        createdAt: faker.date.past(),
    }));
};

export const createMockSupportTickets = (count: number, vendors: Vendor[]): SupportTicket[] => {
    return Array.from({ length: count }, () => {
        const vendor = faker.helpers.arrayElement(vendors);
        return {
            id: faker.string.uuid(),
            vendorId: vendor.id,
            vendorName: vendor.name,
            subject: faker.lorem.sentence(),
            description: faker.lorem.paragraphs(),
            status: faker.helpers.arrayElement(['open', 'in_progress', 'closed']),
            priority: faker.helpers.arrayElement(['low', 'medium', 'high']),
            createdAt: faker.date.recent({ days: 10 }),
            updatedAt: faker.date.recent({ days: 5 }),
        };
    });
};

export const createMockStockTakes = (count: number): StockTake[] => {
    return Array.from({ length: count }, () => ({
        id: `ST-${faker.string.numeric(5)}`,
        vendorId: 'vendor1',
        status: 'completed',
        items: [], // Items would be populated in a real scenario
        createdAt: faker.date.past({ years: 1 }),
        completedAt: faker.date.recent(),
        createdBy: faker.helpers.arrayElement(mockCashiers).id,
        notes: 'Annual stock count',
    }));
};

const mockProducts = createMockProducts(100);
const mockCustomers = createMockCustomers(50);
const mockSales = createMockSales(200, mockProducts, mockCustomers);
const mockSuppliers = createMockSuppliers(20);
const mockPurchases = createMockPurchases(30, mockProducts, mockSuppliers);
const mockStockMovements = createMockStockMovements(150, mockProducts);
const mockVendors = createMockVendors(25);
const mockSupportTickets = createMockSupportTickets(15, mockVendors);
const mockStockTakes = createMockStockTakes(5);

export const mockData = {
    products: mockProducts,
    customers: mockCustomers,
    sales: mockSales,
    suppliers: mockSuppliers,
    purchases: mockPurchases,
    stockMovements: mockStockMovements,
    cashiers: mockCashiers,
    vendors: mockVendors,
    supportTickets: mockSupportTickets,
    stockTakes: mockStockTakes,
};
