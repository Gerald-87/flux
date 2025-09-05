import { faker } from '@faker-js/faker';
import { Sale, Product, Customer, Supplier, Purchase, StockMovement, User, SaleItem, Vendor, SupportTicket, StockTake, ProductVariant } from '../types';

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
            minStock: 10,
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

    // SUPER ADMIN
    const superAdmin: User = {
        id: 'superadmin-01',
        email: 'admin@flux.com',
        password: 'password123',
        role: 'superadmin',
        name: 'Super Admin',
        isActive: true,
        createdAt: new Date(),
    };
    allUsers.push(superAdmin);

    // DEMO VENDOR (for easy login)
    const demoVendorUser: User = {
        id: 'vendor-01',
        email: 'vendor@flux.com',
        password: 'password123',
        role: 'vendor',
        name: 'Flux Demo Store',
        vendorId: 'vendor-01',
        isActive: true,
        createdAt: new Date(),
    };
    const demoVendorDetails: Vendor = {
        id: 'vendor-01',
        name: 'Flux Demo Store',
        email: 'vendor@flux.com',
        phone: '555-0101',
        address: '123 Demo Street',
        businessType: 'General Retail',
        subscriptionPlan: 'premium',
        subscriptionStatus: 'active',
        subscriptionExpiry: faker.date.future(),
        isApproved: true,
        settings: { taxRate: 0.1, currency: 'USD', timezone: 'UTC', receiptHeader: 'Thanks!', receiptFooter: 'Come again!', loyaltyProgram: { enabled: true, pointsPerDollar: 1, redemptionRate: 0.01, minimumPoints: 100 }, notifications: { lowStockAlert: true, lowStockThreshold: 10, emailNotifications: true, smsNotifications: false, dailyReports: true } },
        createdAt: faker.date.past(),
    };
    allUsers.push(demoVendorUser);
    allVendors.push(demoVendorDetails);

    // Generate data for demo vendor
    const demoProducts = generateProductsForVendor('vendor-01', 50);
    allProducts.push(...demoProducts);
    
    const demoCashier: User = {
        id: 'cashier-01',
        email: 'cashier@flux.com',
        password: 'password123',
        role: 'cashier',
        vendorId: 'vendor-01',
        name: 'Jane Doe',
        isActive: true,
        terminalId: 'POS Terminal 1',
        createdAt: new Date(),
    };
    allUsers.push(demoCashier);
    allCashiers.push(demoCashier);

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
            createdAt: new Date(),
        };
        allUsers.push(vendorCashier);
        allCashiers.push(vendorCashier);
    }

    // Generate associated data for all vendors
    allVendors.forEach(vendor => {
        const vendorProducts = allProducts.filter(p => p.vendorId === vendor.id);
        const vendorCashiers = allCashiers.filter(c => c.vendorId === vendor.id);

        const vendorCustomers = Array.from({ length: 20 }, () => ({
            id: faker.string.uuid(),
            vendorId: vendor.id,
            name: faker.person.fullName(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            loyaltyPoints: faker.number.int({ min: 0, max: 1000 }),
            totalSpent: faker.number.float({ min: 100, max: 5000, precision: 2 }),
            visitCount: faker.number.int({ min: 1, max: 50 }),
            isActive: true,
            createdAt: faker.date.past(),
        }));
        allCustomers.push(...vendorCustomers);

        const vendorSales = Array.from({ length: 100 }, () => {
            const items: SaleItem[] = Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => {
                const product = faker.helpers.arrayElement(vendorProducts);
                const quantity = faker.number.int({ min: 1, max: 2 });
                const price = product.price;
                return { productId: product.id, name: product.name, sku: product.sku, price, quantity, discount: 0, total: price * quantity };
            });
            const subtotal = items.reduce((sum, item) => sum + item.total, 0);
            const tax = subtotal * (vendor.settings.taxRate || 0.1);
            return {
                id: faker.string.uuid(),
                receiptNumber: `RCP-${faker.string.numeric(8)}`,
                vendorId: vendor.id,
                cashierId: faker.helpers.arrayElement(vendorCashiers).id,
                terminalId: 'POS Terminal 1',
                customerId: faker.helpers.arrayElement(vendorCustomers).id,
                items,
                subtotal,
                tax,
                discount: 0,
                total: subtotal + tax,
                paid: subtotal + tax,
                change: 0,
                paymentMethod: faker.helpers.arrayElement(['cash', 'card', 'mobile']),
                status: 'completed' as const,
                loyaltyPointsEarned: 0,
                loyaltyPointsUsed: 0,
                createdAt: faker.date.recent({ days: 90 }),
            };
        });
        allSales.push(...vendorSales);

        if (vendorCashiers.length > 0) {
            const vendorStockTakes = Array.from({ length: 5 }, () => ({
                id: faker.string.uuid(),
                vendorId: vendor.id,
                location: faker.helpers.arrayElement(LOCATIONS_PER_VENDOR),
                status: 'completed' as const,
                items: [], // Simplified for now
                createdAt: faker.date.past(),
                completedAt: faker.date.recent(),
                createdBy: faker.helpers.arrayElement(vendorCashiers).id,
                notes: faker.lorem.sentence(),
            }));
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
        locations: ['Main Inventory', 'POS Terminal 1', 'POS Terminal 2'],
    };
};

export const mockData = generateRealisticData();
