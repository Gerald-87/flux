import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Hash password with MD5
const hashPassword = (password: string): string => {
  return crypto.createHash('md5').update(password).digest('hex');
};

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create superadmin user
    const superadmin = await prisma.user.create({
      data: {
        email: 'superadmin@flux.com',
        passwordHash: hashPassword('12345678'),
        role: 'SUPERADMIN',
        vendorId: null,
        name: 'Super Administrator',
        isActive: true
      }
    });

    console.log('✅ Superadmin created: superadmin@flux.com / 12345678');

    // Create demo vendor
    const vendor = await prisma.vendor.create({
      data: {
        name: 'Demo Store',
        email: 'demo@store.com',
        phone: '+1-555-0123',
        address: '123 Main St, Demo City, DC 12345',
        businessType: 'Retail Store',
        subscriptionPlan: 'PREMIUM',
        subscriptionStatus: 'ACTIVE',
        subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isApproved: true
      }
    });

    // Create vendor settings
    await prisma.vendorSettings.create({
      data: {
        vendorId: vendor.id,
        taxRate: 0.0875,
        currency: 'USD',
        timezone: 'America/New_York',
        receiptHeader: 'Thank you for shopping with us!',
        receiptFooter: 'Visit us again soon!',
        loyaltyEnabled: true,
        loyaltyPointsPerDollar: 1.5,
        loyaltyRedemptionRate: 0.01,
        lowStockThreshold: 15
      }
    });

    // Create vendor user
    const vendorUser = await prisma.user.create({
      data: {
        email: 'vendor@demo.com',
        passwordHash: hashPassword('password123'),
        role: 'VENDOR',
        vendorId: vendor.id,
        name: 'John Vendor',
        isActive: true
      }
    });

    // Create cashier users
    const cashier1 = await prisma.user.create({
      data: {
        email: 'cashier1@demo.com',
        passwordHash: hashPassword('cashier123'),
        role: 'CASHIER',
        vendorId: vendor.id,
        name: 'Alice Cashier',
        terminalId: 'TERMINAL-001',
        assignedLocations: ['Main Store', 'Front Counter'],
        isActive: true
      }
    });

    const cashier2 = await prisma.user.create({
      data: {
        email: 'cashier2@demo.com',
        passwordHash: hashPassword('cashier123'),
        role: 'CASHIER',
        vendorId: vendor.id,
        name: 'Bob Cashier',
        terminalId: 'TERMINAL-002',
        assignedLocations: ['Main Store', 'Back Office'],
        isActive: true
      }
    });

    // Create cashier schedules
    await prisma.cashierSchedule.create({
      data: {
        userId: cashier1.id,
        checkInTime: '09:00',
        checkOutTime: '17:00',
        workDays: [1, 2, 3, 4, 5], // Monday to Friday
        timezone: 'America/New_York',
        isActive: true
      }
    });

    await prisma.cashierSchedule.create({
      data: {
        userId: cashier2.id,
        checkInTime: '14:00',
        checkOutTime: '22:00',
        workDays: [0, 2, 4, 6], // Sunday, Tuesday, Thursday, Saturday
        timezone: 'America/New_York',
        isActive: true
      }
    });

    // Create suppliers
    const supplier1 = await prisma.supplier.create({
      data: {
        vendorId: vendor.id,
        name: 'Tech Supplies Co.',
        contactPerson: 'Sarah Johnson',
        email: 'sarah@techsupplies.com',
        phone: '+1-555-0200',
        address: '456 Industrial Ave, Supply City, SC 67890',
        paymentTerms: 'Net 30',
        isActive: true
      }
    });

    const supplier2 = await prisma.supplier.create({
      data: {
        vendorId: vendor.id,
        name: 'Global Electronics',
        contactPerson: 'Mike Chen',
        email: 'mike@globalelectronics.com',
        phone: '+1-555-0300',
        address: '789 Commerce Blvd, Trade City, TC 13579',
        paymentTerms: 'Net 15',
        isActive: true
      }
    });

    // Create product categories and products
    const categories = ['Electronics', 'Accessories', 'Software', 'Hardware', 'Gaming'];
    const products = [];

    for (let i = 1; i <= 50; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const price = Math.floor(Math.random() * 500) + 10;
      const costPrice = Math.floor(price * 0.6);
      const minStock = Math.floor(Math.random() * 20) + 5;
      const totalStock = Math.floor(Math.random() * 100) + minStock;

      const product = await prisma.product.create({
        data: {
          vendorId: vendor.id,
          name: `Product ${i}`,
          description: `This is a demo product #${i} in the ${category} category.`,
          sku: `PROD-${String(i).padStart(3, '0')}`,
          barcode: `123456789${String(i).padStart(3, '0')}`,
          category,
          brand: `Brand ${Math.floor(Math.random() * 10) + 1}`,
          price,
          costPrice,
          totalStock,
          minStock,
          maxStock: 1000,
          unit: 'piece',
          images: [`/images/product-${i}.jpg`],
          isActive: true,
          trackExpiry: Math.random() > 0.7,
          trackSerial: Math.random() > 0.8,
          tags: [category.toLowerCase(), 'demo', 'sample']
        }
      });

      products.push(product);

      // Create stock locations
      const locations = ['Main Store', 'Warehouse', 'Front Counter'];
      for (const location of locations) {
        const quantity = Math.floor(totalStock / locations.length) + Math.floor(Math.random() * 10);
        
        await prisma.productStockLocation.create({
          data: {
            productId: product.id,
            locationName: location,
            quantity: Math.max(0, quantity)
          }
        });
      }
    }

    // Assign some products to cashiers
    const assignedProducts = products.slice(0, 20);
    for (const product of assignedProducts) {
      await prisma.cashierProductAssignment.create({
        data: {
          userId: cashier1.id,
          productId: product.id
        }
      });
    }

    const assignedProducts2 = products.slice(15, 35);
    for (const product of assignedProducts2) {
      await prisma.cashierProductAssignment.create({
        data: {
          userId: cashier2.id,
          productId: product.id
        }
      });
    }

    // Create customers
    const customers = [];
    for (let i = 1; i <= 25; i++) {
      const customer = await prisma.customer.create({
        data: {
          vendorId: vendor.id,
          name: `Customer ${i}`,
          email: `customer${i}@email.com`,
          phone: `+1-555-${String(i).padStart(4, '0')}`,
          address: `${i * 10} Customer St, Customer City, CC ${String(i).padStart(5, '0')}`,
          loyaltyPoints: Math.floor(Math.random() * 500),
          totalSpent: Math.floor(Math.random() * 2000),
          visitCount: Math.floor(Math.random() * 20) + 1,
          lastVisit: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
          isActive: true
        }
      });
      customers.push(customer);
    }

    // Create sample purchases
    for (let i = 1; i <= 10; i++) {
      const supplier = Math.random() > 0.5 ? supplier1 : supplier2;
      const itemCount = Math.floor(Math.random() * 5) + 1;
      let subtotal = 0;

      const purchase = await prisma.purchase.create({
        data: {
          vendorId: vendor.id,
          supplierId: supplier.id,
          purchaseNumber: `PO-${String(i).padStart(4, '0')}`,
          subtotal: 0, // Will update after items
          tax: 0,
          total: 0, // Will update after items
          status: Math.random() > 0.3 ? 'COMPLETED' : 'PENDING',
          deliveryDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
          notes: `Purchase order #${i} for restocking inventory`
        }
      });

      // Add purchase items
      for (let j = 0; j < itemCount; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 20) + 5;
        const costPrice = product.costPrice;
        const total = quantity * costPrice;
        subtotal += total;

        await prisma.purchaseItem.create({
          data: {
            purchaseId: purchase.id,
            productId: product.id,
            name: product.name,
            sku: product.sku,
            costPrice,
            quantity,
            total
          }
        });
      }

      // Update purchase totals
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: {
          subtotal,
          total: subtotal
        }
      });
    }

    // Create sample sales
    for (let i = 1; i <= 30; i++) {
      const cashier = Math.random() > 0.5 ? cashier1 : cashier2;
      const customer = Math.random() > 0.3 ? customers[Math.floor(Math.random() * customers.length)] : null;
      const itemCount = Math.floor(Math.random() * 5) + 1;
      let subtotal = 0;

      const sale = await prisma.sale.create({
        data: {
          vendorId: vendor.id,
          cashierId: cashier.id,
          terminalId: cashier.terminalId!,
          customerId: customer?.id,
          receiptNumber: `RCP-${String(i).padStart(6, '0')}`,
          subtotal: 0, // Will update after items
          tax: 0,
          discount: 0,
          total: 0, // Will update after items
          paid: 0, // Will update after items
          changeAmount: 0,
          paymentMethod: ['CASH', 'CARD', 'MOBILE'][Math.floor(Math.random() * 3)] as any,
          status: 'COMPLETED',
          loyaltyPointsEarned: 0,
          loyaltyPointsUsed: 0,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
        }
      });

      // Add sale items
      for (let j = 0; j < itemCount; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = product.price;
        const discount = Math.random() > 0.8 ? Math.floor(price * 0.1) : 0;
        const total = (price - discount) * quantity;
        subtotal += total;

        await prisma.saleItem.create({
          data: {
            saleId: sale.id,
            productId: product.id,
            name: product.name,
            sku: product.sku,
            price,
            quantity,
            discount,
            total
          }
        });
      }

      const tax = subtotal * 0.0875;
      const finalTotal = subtotal + tax;
      const paid = finalTotal + Math.floor(Math.random() * 20); // Add some change
      const changeAmount = paid - finalTotal;
      const loyaltyPointsEarned = customer ? Math.floor(finalTotal * 1.5) : 0;

      // Update sale totals
      await prisma.sale.update({
        where: { id: sale.id },
        data: {
          subtotal,
          tax,
          total: finalTotal,
          paid,
          changeAmount,
          loyaltyPointsEarned
        }
      });
    }

    // Create notifications
    await prisma.notification.create({
      data: {
        vendorId: vendor.id,
        type: 'LOW_STOCK',
        title: 'Low Stock Alert',
        message: 'Several products are running low on stock. Please review and reorder.',
        isRead: false,
        link: '/products?filter=low-stock'
      }
    });

    await prisma.notification.create({
      data: {
        vendorId: vendor.id,
        type: 'SYSTEM',
        title: 'Welcome to Flux POS',
        message: 'Your account has been set up successfully. Start exploring the features!',
        isRead: false,
        link: '/dashboard'
      }
    });

    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Demo Accounts Created:');
    console.log('👑 Superadmin: superadmin@flux.com / 12345678');
    console.log('🏪 Vendor: vendor@demo.com / password123');
    console.log('💰 Cashier 1: cashier1@demo.com / cashier123');
    console.log('💰 Cashier 2: cashier2@demo.com / cashier123');
    console.log('\n📊 Sample Data:');
    console.log(`• ${products.length} Products`);
    console.log(`• ${customers.length} Customers`);
    console.log('• 10 Purchase Orders');
    console.log('• 30 Sales Transactions');
    console.log('• 2 Suppliers');
    console.log('• Stock locations and movements');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
