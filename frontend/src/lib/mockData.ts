import { faker } from '@faker-js/faker';
import { Sale, Product, Customer, Supplier, Purchase, StockMovement, User, SaleItem, Vendor, SupportTicket, StockTake, ProductVariant, AuditLog, Notification, Report, PurchaseItem } from '../types';

const VENDOR_COUNT = 3;
const LOCATIONS_PER_VENDOR = ['Main Inventory', 'POS Terminal 1'];

const generateVariants = (productName: string) => {
    const hasVariants = faker.datatype.boolean(0.4);
    if (!hasVariants) return undefined;

    const variantType = faker.helpers.arrayElement(['Size', 'Color', 'Style']);
    let values: string[];
    if (variantType === 'Size') values = ['S', 'M', 'L', 'XL'];
    else if (variantType === 'Color') values = ['Red', 'Blue', 'Black'];
    else values = ['Classic', 'Modern'];
    
    return values.map(value => {
        const priceModifier = faker.helpers.arrayElement([0, 2, -2, 5]);
        return {
            id: faker.string.uuid(),
            name: variantType,
            value: value,
            priceModifier,
            stock: faker.number.int({ min: 5, max: 50 }),
            sku: `${productName.substring(0,3).toUpperCase()}-${value.substring(0,2).toUpperCase()}-${faker.string.alphanumeric(3)}`,
            barcode: faker.string.numeric(12),
        };
    });
};

const generateProductsForVendor = (vendorId: string, count: number): Product[] => {
    return Array.from({ length: count }, () => {
        const name = faker.commerce.productName();
        const variants = generateVariants(name);
        const stockByLocation: { [locationId: string]: number } = {};
        
        LOCATIONS_PER_VENDOR.forEach(loc => {
            stockByLocation[loc] = faker.number.int({ min: 0, max: 150 });
        });
        
        // Ensure some products have low stock for demo purposes
        const shouldBeLowStock = faker.datatype.boolean(0.3); // 30% chance
        if (shouldBeLowStock) {
            // Override some locations to have very low stock
            const lowStockLocation = faker.helpers.arrayElement(LOCATIONS_PER_VENDOR);
            stockByLocation[lowStockLocation] = faker.number.int({ min: 1, max: 8 });
        }
        
        const totalStock = Object.values(stockByLocation).reduce((sum, val) => sum + val, 0);

        return {
            id: faker.string.uuid(),
            vendorId,
            name,
            description: faker.commerce.productDescription(),
            sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
            barcode: faker.string.numeric(12),
            category: faker.commerce.department(),
            brand: faker.company.name(),
            price: parseFloat(faker.commerce.price()),
            costPrice: parseFloat(faker.commerce.price({ min: 10, max: 200 })),
            stock: totalStock,
            stockByLocation,
            minStock: faker.number.int({ min: 15, max: 25 }),
            maxStock: 200,
            unit: 'piece',
            images: [faker.image.urlLoremFlickr({ category: 'technics' })],
            isActive: faker.datatype.boolean(0.9),
            trackExpiry: false,
            trackSerial: false,
            tags: [faker.commerce.productAdjective()],
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent(),
            variants,
        };
    });
};

const generateRealisticData = () => {
    const allUsers: User[] = [];
    const allVendors: Vendor[] = [];
    const allProducts: Product[] = [];
    const allCustomers: Customer[] = [];
    const allCashiers: User[] = [];
    const allSales: Sale[] = [];
    const allSuppliers: Supplier[] = [];
    const allPurchases: Purchase[] = [];
    const allStockMovements: StockMovement[] = [];
    const allStockTakes: StockTake[] = [];
    const allSupportTickets: SupportTicket[] = [];
    const allAuditLogs: AuditLog[] = [];
    const allNotifications: Notification[] = [];
    const allReports: Report[] = [];

    // No hardcoded demo users - all users should come from database

    // Generate other vendors
    for (let i = 2; i <= VENDOR_COUNT; i++) {
        const vendorId = `vendor-0${i}`;
        const vendorUser: User = {
            id: vendorId,
            email: `vendor${i}@test.com`,
            password: 'password123',
            role: 'vendor',
            name: faker.company.name(),
            vendorId,
            isActive: true,
            createdAt: faker.date.past(),
        };
        const vendorDetails: Vendor = {
            id: vendorId,
            name: vendorUser.name,
            email: vendorUser.email,
            phone: faker.phone.number(),
            address: faker.location.streetAddress(),
            businessType: 'Retail',
            subscriptionPlan: faker.helpers.arrayElement(['basic', 'standard']),
            subscriptionStatus: 'active',
            subscriptionExpiry: faker.date.future(),
            isApproved: true,
            settings: { taxRate: 0.08, currency: 'USD', timezone: 'UTC', receiptHeader: 'Thank you', receiptFooter: 'See you soon', loyaltyProgram: { enabled: true, pointsPerDollar: 1, redemptionRate: 0.01, minimumPoints: 100 }, notifications: { lowStockAlert: true, lowStockThreshold: 10, emailNotifications: true, smsNotifications: false, dailyReports: true } },
            createdAt: vendorUser.createdAt,
        };
        allUsers.push(vendorUser);
        allVendors.push(vendorDetails);

        const vendorProducts = generateProductsForVendor(vendorId, 30);
        allProducts.push(...vendorProducts);

        const vendorCashier: User = {
            id: `cashier-0${i}`,
            email: `cashier${i}@test.com`,
            password: 'password123',
            role: 'cashier',
            vendorId,
            name: faker.person.fullName(),
            isActive: true,
            terminalId: 'POS Terminal 1',
            assignedInventoryIds: [], // Will be populated with specific product IDs
            assignedLocations: ['POS Terminal 1'],
            workSchedule: {
                checkInTime: i === 1 ? '18:00' : '09:00', // Test cashier with late start
                checkOutTime: i === 1 ? '22:00' : '17:00', // Test cashier with late end
                workDays: i === 2 ? [6, 0] : [1, 2, 3, 4, 5], // Test weekend-only cashier
                timezone: 'UTC'
            },
            createdAt: new Date(),
        };
        allUsers.push(vendorCashier);
        allCashiers.push(vendorCashier);
    }

    // Generate associated data for all vendors
    allVendors.forEach(vendor => {
        const vendorProducts = allProducts.filter(p => p.vendorId === vendor.id);
        const vendorCashiers = allCashiers.filter(c => c.vendorId === vendor.id);
        
        // Assign specific products to each cashier
        vendorCashiers.forEach(cashier => {
            const assignedProducts = vendorProducts.slice(0, Math.floor(vendorProducts.length * 0.6)); // 60% of products
            cashier.assignedInventoryIds = assignedProducts.map(p => p.id);
        });

        // Generate Suppliers for this vendor
        const vendorSuppliers = Array.from({ length: 8 }, () => ({
            id: faker.string.uuid(),
            vendorId: vendor.id,
            name: faker.company.name(),
            contactPerson: faker.person.fullName(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            address: faker.location.streetAddress({ useFullAddress: true }),
            paymentTerms: faker.helpers.arrayElement(['Net 30', 'Net 15', 'COD', '2/10 Net 30']),
            isActive: faker.datatype.boolean(0.9),
            createdAt: faker.date.past(),
        }));
        allSuppliers.push(...vendorSuppliers);

        const vendorCustomers = Array.from({ length: 20 }, () => ({
            id: faker.string.uuid(),
            vendorId: vendor.id,
            name: faker.person.fullName(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            address: faker.location.streetAddress({ useFullAddress: true }),
            dateOfBirth: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }),
            loyaltyPoints: faker.number.int({ min: 0, max: 1000 }),
            totalSpent: faker.number.float({ min: 100, max: 5000, precision: 2 }),
            visitCount: faker.number.int({ min: 1, max: 50 }),
            lastVisit: faker.date.recent({ days: 30 }),
            isActive: true,
            notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : undefined,
            createdAt: faker.date.past(),
        }));
        allCustomers.push(...vendorCustomers);

        // Generate cashier-specific sales with more detailed tracking
        vendorCashiers.forEach(cashier => {
            const cashierAssignedProducts = vendorProducts.filter(p => cashier.assignedInventoryIds?.includes(p.id));
            const cashierSales = Array.from({ length: faker.number.int({ min: 30, max: 80 }) }, () => {
                const items: SaleItem[] = Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => {
                    const product = faker.helpers.arrayElement(cashierAssignedProducts.length > 0 ? cashierAssignedProducts : vendorProducts);
                    const quantity = faker.number.int({ min: 1, max: 3 });
                    const price = product.price;
                    const discount = faker.datatype.boolean(0.2) ? faker.number.float({ min: 0, max: price * 0.1, precision: 2 }) : 0;
                    return { 
                        productId: product.id, 
                        name: product.name, 
                        sku: product.sku, 
                        price, 
                        quantity, 
                        discount,
                        total: (price * quantity) - discount
                    };
                });
                const subtotal = items.reduce((sum, item) => sum + item.total, 0);
                const tax = subtotal * (vendor.settings.taxRate || 0.1);
                const total = subtotal + tax;
                return {
                    id: faker.string.uuid(),
                    receiptNumber: `RCP-${faker.string.numeric(8)}`,
                    vendorId: vendor.id,
                    cashierId: cashier.id,
                    terminalId: cashier.terminalId || 'POS Terminal 1',
                    customerId: faker.datatype.boolean(0.7) ? faker.helpers.arrayElement(vendorCustomers).id : undefined,
                    items,
                    subtotal,
                    tax,
                    discount: items.reduce((sum, item) => sum + item.discount, 0),
                    total,
                    paid: total,
                    change: 0,
                    paymentMethod: faker.helpers.arrayElement(['cash', 'card', 'mobile', 'loyalty']) as 'cash' | 'card' | 'mobile' | 'loyalty',
                    status: faker.helpers.arrayElement(['completed', 'completed', 'completed', 'refunded']) as 'completed' | 'refunded',
                    refundAmount: undefined,
                    loyaltyPointsEarned: Math.floor(total * 0.1),
                    loyaltyPointsUsed: 0,
                    notes: faker.datatype.boolean(0.1) ? faker.lorem.sentence() : undefined,
                    createdAt: faker.date.recent(),
                };
            });
            allSales.push(...cashierSales);
        });

        // Generate Purchases
        const vendorPurchases = Array.from({ length: 15 }, () => {
            const supplier = faker.helpers.arrayElement(vendorSuppliers);
            const purchaseItems: PurchaseItem[] = Array.from({ length: faker.number.int({ min: 2, max: 8 }) }, () => {
                const product = faker.helpers.arrayElement(vendorProducts);
                const quantity = faker.number.int({ min: 10, max: 100 });
                const costPrice = product.costPrice;
                return {
                    productId: product.id,
                    name: product.name,
                    sku: product.sku,
                    costPrice,
                    quantity,
                    total: costPrice * quantity
                };
            });
            const subtotal = purchaseItems.reduce((sum, item) => sum + item.total, 0);
            const tax = subtotal * 0.08;
            return {
                id: faker.string.uuid(),
                vendorId: vendor.id,
                supplierId: supplier.id,
                purchaseNumber: `PO-${faker.string.numeric(6)}`,
                items: purchaseItems,
                subtotal,
                tax,
                total: subtotal + tax,
                status: faker.helpers.arrayElement(['pending', 'completed', 'completed', 'completed']) as 'pending' | 'completed' | 'cancelled',
                deliveryDate: faker.date.future(),
                notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : undefined,
                createdAt: faker.date.past(),
            };
        });
        allPurchases.push(...vendorPurchases);

        // Generate Stock Movements
        const vendorStockMovements = Array.from({ length: 200 }, () => {
            const product = faker.helpers.arrayElement(vendorProducts);
            const type = faker.helpers.arrayElement(['sale', 'purchase', 'adjustment', 'transfer', 'return']);
            const quantity = type === 'sale' ? -faker.number.int({ min: 1, max: 5 }) : faker.number.int({ min: 1, max: 50 });
            return {
                id: faker.string.uuid(),
                vendorId: vendor.id,
                productId: product.id,
                type: type as 'sale' | 'purchase' | 'adjustment' | 'transfer' | 'return',
                quantity,
                reference: type === 'sale' ? `Sale-${faker.string.numeric(6)}` : 
                          type === 'purchase' ? `PO-${faker.string.numeric(6)}` : 
                          `ADJ-${faker.string.numeric(6)}`,
                notes: faker.datatype.boolean(0.4) ? faker.lorem.sentence() : undefined,
                createdAt: faker.date.recent(),
                createdBy: faker.helpers.arrayElement(vendorCashiers).id,
                from: type === 'transfer' ? faker.helpers.arrayElement(LOCATIONS_PER_VENDOR) : undefined,
                to: type === 'transfer' ? faker.helpers.arrayElement(LOCATIONS_PER_VENDOR) : undefined,
            };
        });
        allStockMovements.push(...vendorStockMovements);

        // Generate Support Tickets
        const vendorSupportTickets = Array.from({ length: 12 }, () => ({
            id: faker.string.uuid(),
            vendorId: vendor.id,
            vendorName: vendor.name,
            subject: faker.helpers.arrayElement([
                'POS Terminal Not Working',
                'Inventory Sync Issues',
                'Payment Processing Error',
                'Report Generation Problem',
                'User Access Issues',
                'Barcode Scanner Malfunction',
                'Receipt Printer Problems',
                'Stock Count Discrepancy'
            ]),
            description: faker.lorem.paragraphs(2),
            status: faker.helpers.arrayElement(['open', 'in_progress', 'closed', 'closed']) as 'open' | 'in_progress' | 'closed',
            priority: faker.helpers.arrayElement(['low', 'medium', 'high']) as 'low' | 'medium' | 'high',
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent(),
        }));
        allSupportTickets.push(...vendorSupportTickets);

        // Generate Audit Logs
        const vendorAuditLogs = Array.from({ length: 50 }, () => {
            const actions = ['CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT', 'CREATE_SALE', 'REFUND_SALE', 'UPDATE_CUSTOMER', 'CREATE_PURCHASE', 'UPDATE_STOCK'];
            const resources = ['Product', 'Sale', 'Customer', 'Purchase', 'Stock'];
            const action = faker.helpers.arrayElement(actions);
            const resource = faker.helpers.arrayElement(resources);
            return {
                id: faker.string.uuid(),
                vendorId: vendor.id,
                userId: faker.helpers.arrayElement(vendorCashiers).id,
                action,
                resource,
                resourceId: faker.string.uuid(),
                oldValues: faker.datatype.boolean(0.5) ? { name: faker.commerce.productName(), price: faker.number.float({ min: 10, max: 100 }) } : undefined,
                newValues: { name: faker.commerce.productName(), price: faker.number.float({ min: 10, max: 100 }) },
                ipAddress: faker.internet.ip(),
                userAgent: faker.internet.userAgent(),
                createdAt: faker.date.recent(),
            };
        });
        allAuditLogs.push(...vendorAuditLogs);

        // Generate Notifications
        const vendorNotifications = Array.from({ length: 20 }, () => {
            const types = ['low_stock', 'purchase_received', 'stock_take_complete', 'system', 'transfer_complete'];
            const type = faker.helpers.arrayElement(types) as 'low_stock' | 'purchase_received' | 'stock_take_complete' | 'system' | 'transfer_complete';
            let title, message;
            switch (type) {
                case 'low_stock':
                    title = 'Low Stock Alert';
                    message = `${faker.commerce.productName()} is running low on stock`;
                    break;
                case 'purchase_received':
                    title = 'Purchase Received';
                    message = `Purchase order PO-${faker.string.numeric(6)} has been received`;
                    break;
                case 'stock_take_complete':
                    title = 'Stock Take Complete';
                    message = `Stock take for ${faker.helpers.arrayElement(LOCATIONS_PER_VENDOR)} has been completed`;
                    break;
                case 'system':
                    title = 'System Update';
                    message = 'System maintenance scheduled for tonight';
                    break;
                default:
                    title = 'Transfer Complete';
                    message = `Stock transfer between locations has been completed`;
            }
            return {
                id: faker.string.uuid(),
                type,
                title,
                message,
                isRead: faker.datatype.boolean(0.6),
                createdAt: faker.date.recent(),
                link: faker.datatype.boolean(0.4) ? `/products/${faker.string.uuid()}` : undefined,
            };
        });
        allNotifications.push(...vendorNotifications);

        // Generate Reports
        const vendorReports = Array.from({ length: 10 }, () => {
            const types = ['sales', 'inventory', 'customer', 'profit'];
            const periods = ['daily', 'weekly', 'monthly', 'yearly', 'custom'];
            const type = faker.helpers.arrayElement(types) as 'sales' | 'inventory' | 'customer' | 'profit';
            const period = faker.helpers.arrayElement(periods) as 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
            const startDate = faker.date.past();
            const endDate = faker.date.between({ from: startDate, to: new Date() });
            return {
                id: faker.string.uuid(),
                vendorId: vendor.id,
                type,
                period,
                startDate,
                endDate,
                data: {
                    totalSales: faker.number.float({ min: 1000, max: 50000, multipleOf: 0.01 }),
                    totalOrders: faker.number.int({ min: 50, max: 500 }),
                    averageOrderValue: faker.number.float({ min: 20, max: 200, multipleOf: 0.01 }),
                    topProducts: Array.from({ length: 5 }, () => ({
                        name: faker.commerce.productName(),
                        sales: faker.number.float({ min: 100, max: 5000, multipleOf: 0.01 })
                    }))
                },
                generatedAt: faker.date.recent(),
                generatedBy: faker.helpers.arrayElement(vendorCashiers).id,
            };
        });
        allReports.push(...vendorReports);

        if (vendorCashiers.length > 0) {
            const vendorStockTakes = Array.from({ length: 8 }, () => {
                const stockTakeItems = vendorProducts.slice(0, faker.number.int({ min: 5, max: 15 })).map(product => {
                    const expected = product.stock;
                    const counted = expected + faker.number.int({ min: -5, max: 5 });
                    return {
                        productId: product.id,
                        productName: product.name,
                        sku: product.sku,
                        expected,
                        counted,
                        variance: counted - expected
                    };
                });
                return {
                    id: faker.string.uuid(),
                    vendorId: vendor.id,
                    location: faker.helpers.arrayElement(LOCATIONS_PER_VENDOR),
                    status: faker.helpers.arrayElement(['completed', 'completed', 'in_progress']) as 'completed' | 'in_progress' | 'cancelled',
                    items: stockTakeItems,
                    createdAt: faker.date.past(),
                    completedAt: faker.date.recent(),
                    createdBy: faker.helpers.arrayElement(vendorCashiers).id,
                    notes: faker.datatype.boolean(0.5) ? faker.lorem.sentence() : undefined,
                };
            });
            allStockTakes.push(...vendorStockTakes);
        }
    });

    return {
        users: allUsers,
        vendors: allVendors,
        products: allProducts,
        customers: allCustomers,
        cashiers: allCashiers,
        sales: allSales,
        suppliers: allSuppliers,
        purchases: allPurchases,
        stockMovements: allStockMovements,
        stockTakes: allStockTakes,
        supportTickets: allSupportTickets,
        auditLogs: allAuditLogs,
        notifications: allNotifications,
        reports: allReports,
        locations: ['Main Inventory', 'POS Terminal 1', 'POS Terminal 2'],
    };
};

export const mockData = generateRealisticData();
