import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return createHash('md5').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.productStockLocation.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.stockTakeItem.deleteMany();
  await prisma.stockTake.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.cashierSchedule.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.vendorSettings.deleteMany();
  await prisma.vendor.deleteMany();

  const hashedPassword = hashPassword('12345678');

  // 1. Create SuperAdmin (if not exists)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@flux.com' },
    update: {},
    create: {
      email: 'superadmin@flux.com',
      passwordHash: hashedPassword,
      name: 'Super Admin',
      role: 'SUPERADMIN',
      isActive: true,
    },
  });

  console.log('✅ SuperAdmin created');

  // 2. Create 12 Vendors
  const vendors = [];
  const vendorData = [
    { name: 'TechMart Electronics', email: 'admin@techmart.com', businessType: 'Electronics', phone: '+1-555-0101', address: '123 Tech Street, Silicon Valley, CA' },
    { name: 'Fresh Foods Market', email: 'manager@freshfoods.com', businessType: 'Grocery', phone: '+1-555-0102', address: '456 Market Ave, Downtown, NY' },
    { name: 'Fashion Forward Boutique', email: 'owner@fashionforward.com', businessType: 'Clothing', phone: '+1-555-0103', address: '789 Style Blvd, Fashion District, LA' },
    { name: 'Home & Garden Center', email: 'info@homegarden.com', businessType: 'Home Improvement', phone: '+1-555-0104', address: '321 Garden Way, Suburbia, TX' },
    { name: 'Sports Zone Pro', email: 'contact@sportszone.com', businessType: 'Sports Equipment', phone: '+1-555-0105', address: '654 Athletic Dr, Sports City, FL' },
    { name: 'Book Haven Library', email: 'librarian@bookhaven.com', businessType: 'Books & Media', phone: '+1-555-0106', address: '987 Reading Rd, University Town, MA' },
    { name: 'Auto Parts Express', email: 'service@autoparts.com', businessType: 'Automotive', phone: '+1-555-0107', address: '147 Motor St, Industrial Zone, MI' },
    { name: 'Beauty & Wellness Spa', email: 'reception@beautywellness.com', businessType: 'Beauty & Health', phone: '+1-555-0108', address: '258 Wellness Way, Uptown, WA' },
    { name: 'Pet Paradise Store', email: 'care@petparadise.com', businessType: 'Pet Supplies', phone: '+1-555-0109', address: '369 Pet Lane, Animal District, CO' },
    { name: 'Coffee Corner Cafe', email: 'barista@coffeecorner.com', businessType: 'Food & Beverage', phone: '+1-555-0110', address: '741 Brew Street, Coffee Town, OR' },
    { name: 'Toy World Emporium', email: 'fun@toyworld.com', businessType: 'Toys & Games', phone: '+1-555-0111', address: '852 Play Ave, Kid City, NV' },
    { name: 'Office Supply Hub', email: 'supplies@officehub.com', businessType: 'Office Supplies', phone: '+1-555-0112', address: '963 Business Blvd, Corporate Center, IL' }
  ];

  for (let i = 0; i < vendorData.length; i++) {
    const data = vendorData[i];
    const vendor = await prisma.vendor.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        businessType: data.businessType,
        subscriptionPlan: i < 3 ? 'ENTERPRISE' : i < 6 ? 'PREMIUM' : i < 9 ? 'BASIC' : 'TRIAL',
        subscriptionStatus: i < 10 ? 'ACTIVE' : 'TRIALING',
        subscriptionExpiry: new Date(Date.now() + (30 + i * 10) * 24 * 60 * 60 * 1000),
        isApproved: i < 11,
      },
    });

    // Create vendor settings
    await prisma.vendorSettings.create({
      data: {
        vendorId: vendor.id,
        taxRate: 0.08 + (i * 0.005),
        loyaltyPointsPerDollar: 1 + (i * 0.1),
        lowStockThreshold: 10 + i,
      },
    });

    vendors.push(vendor);
  }

  console.log('✅ 12 Vendors created');

  // 3. Create Users (Vendor Owners + Cashiers)
  const users = [];
  
  // Create vendor owner users
  for (let i = 0; i < vendors.length; i++) {
    const vendor = vendors[i];
    const user = await prisma.user.create({
      data: {
        email: vendor.email,
        password: hashedPassword,
        firstName: `Owner${i + 1}`,
        lastName: `Vendor${i + 1}`,
        role: 'VENDOR',
        vendorId: vendor.id,
        isActive: true,
      },
    });
    users.push(user);
  }

  // Create 15 cashiers across different vendors
  const cashierNames = [
    { firstName: 'Alice', lastName: 'Johnson' },
    { firstName: 'Bob', lastName: 'Smith' },
    { firstName: 'Carol', lastName: 'Davis' },
    { firstName: 'David', lastName: 'Wilson' },
    { firstName: 'Emma', lastName: 'Brown' },
    { firstName: 'Frank', lastName: 'Miller' },
    { firstName: 'Grace', lastName: 'Taylor' },
    { firstName: 'Henry', lastName: 'Anderson' },
    { firstName: 'Ivy', lastName: 'Thomas' },
    { firstName: 'Jack', lastName: 'Jackson' },
    { firstName: 'Kate', lastName: 'White' },
    { firstName: 'Leo', lastName: 'Harris' },
    { firstName: 'Mia', lastName: 'Martin' },
    { firstName: 'Noah', lastName: 'Thompson' },
    { firstName: 'Olivia', lastName: 'Garcia' }
  ];

  for (let i = 0; i < 15; i++) {
    const vendorIndex = i % vendors.length;
    const name = cashierNames[i];
    const user = await prisma.user.create({
      data: {
        email: `${name.firstName.toLowerCase()}.${name.lastName.toLowerCase()}@${vendors[vendorIndex].email.split('@')[1]}`,
        password: hashedPassword,
        firstName: name.firstName,
        lastName: name.lastName,
        role: 'CASHIER',
        vendorId: vendors[vendorIndex].id,
        isActive: i < 13, // 2 inactive cashiers
      },
    });

    // Create cashier schedule
    await prisma.cashierSchedule.create({
      data: {
        userId: user.id,
        monday: i % 7 !== 0,
        tuesday: i % 7 !== 1,
        wednesday: i % 7 !== 2,
        thursday: i % 7 !== 3,
        friday: i % 7 !== 4,
        saturday: i % 6 === 0,
        sunday: i % 7 === 0,
        startTime: `${8 + (i % 4)}:00`,
        endTime: `${16 + (i % 4)}:00`,
      },
    });

    users.push(user);
  }

  console.log('✅ 27 Users created (12 vendors + 15 cashiers)');

  // 4. Create 15 Support Tickets
  const ticketSubjects = [
    'Payment processing issue',
    'Inventory sync problem',
    'Login authentication error',
    'Receipt printer not working',
    'Barcode scanner malfunction',
    'Database connection timeout',
    'Customer data export request',
    'Subscription upgrade inquiry',
    'Tax calculation discrepancy',
    'Multi-location setup help',
    'API integration support',
    'Mobile app sync issue',
    'Backup and restore question',
    'Performance optimization',
    'Security audit request'
  ];

  const ticketStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  const ticketPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  for (let i = 0; i < 15; i++) {
    await prisma.supportTicket.create({
      data: {
        vendorId: vendors[i % vendors.length].id,
        vendorName: vendors[i % vendors.length].name,
        subject: ticketSubjects[i],
        description: `Detailed description for ${ticketSubjects[i]}. This ticket was created to address specific issues related to the system functionality and requires immediate attention from our support team.`,
        status: ticketStatuses[i % ticketStatuses.length],
        priority: ticketPriorities[i % ticketPriorities.length],
      },
    });
  }

  console.log('✅ 15 Support tickets created');

  // 5. Create 20 Customers per vendor (240 total)
  const customerFirstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Chris', 'Amy', 'Tom', 'Kate', 'Steve', 'Emma', 'Paul', 'Anna', 'Mark', 'Lucy', 'James', 'Mary', 'Robert', 'Linda'];
  const customerLastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

  const customers = [];
  for (let v = 0; v < vendors.length; v++) {
    for (let i = 0; i < 20; i++) {
      const firstName = customerFirstNames[i % customerFirstNames.length];
      const lastName = customerLastNames[i % customerLastNames.length];
      const customer = await prisma.customer.create({
        data: {
          vendorId: vendors[v].id,
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${v}.${i}@email.com`,
          phone: `+1-555-${String(v * 100 + i).padStart(4, '0')}`,
          address: `${100 + i} Customer St, City ${v + 1}`,
          loyaltyPoints: Math.floor(Math.random() * 1000),
          totalSpent: Math.floor(Math.random() * 5000),
          visitCount: Math.floor(Math.random() * 50) + 1,
        },
      });
      customers.push(customer);
    }
  }

  console.log('✅ 240 Customers created (20 per vendor)');

  // 6. Create 15 Suppliers per vendor (180 total)
  const supplierNames = [
    'Global Electronics Supply', 'Fresh Produce Distributors', 'Fashion Wholesale Inc',
    'Home Goods Supplier', 'Sports Equipment Co', 'Book Distribution Network',
    'Auto Parts Warehouse', 'Beauty Products Supply', 'Pet Food Distributors',
    'Coffee Bean Importers', 'Toy Manufacturing Ltd', 'Office Supply Chain',
    'Tech Components Inc', 'Organic Foods Supply', 'Clothing Manufacturers'
  ];

  const suppliers = [];
  for (let v = 0; v < vendors.length; v++) {
    for (let i = 0; i < 15; i++) {
      const supplier = await prisma.supplier.create({
        data: {
          vendorId: vendors[v].id,
          name: `${supplierNames[i % supplierNames.length]} ${v + 1}`,
          contactPerson: `Contact Person ${i + 1}`,
          email: `supplier${i + 1}.vendor${v + 1}@supply.com`,
          phone: `+1-800-${String(v * 100 + i).padStart(4, '0')}`,
          address: `${200 + i} Supplier Blvd, Industrial Zone ${v + 1}`,
        },
      });
      suppliers.push(supplier);
    }
  }

  console.log('✅ 180 Suppliers created (15 per vendor)');

  // 7. Create 25 Products per vendor (300 total)
  const productCategories = ['Electronics', 'Food', 'Clothing', 'Home', 'Sports', 'Books', 'Auto', 'Beauty', 'Pets', 'Beverages', 'Toys', 'Office'];
  const productNames = [
    'Wireless Headphones', 'Organic Apples', 'Cotton T-Shirt', 'LED Desk Lamp', 'Basketball',
    'Programming Guide', 'Car Battery', 'Face Moisturizer', 'Dog Food', 'Coffee Beans',
    'Building Blocks', 'Notebook Set', 'Smartphone Case', 'Energy Drink', 'Yoga Mat',
    'Cooking Pan', 'Running Shoes', 'Mystery Novel', 'Phone Charger', 'Shampoo',
    'Cat Toy', 'Green Tea', 'Puzzle Game', 'Pen Set', 'Tablet Stand'
  ];

  const products = [];
  for (let v = 0; v < vendors.length; v++) {
    for (let i = 0; i < 25; i++) {
      const product = await prisma.product.create({
        data: {
          vendorId: vendors[v].id,
          name: `${productNames[i % productNames.length]} ${v + 1}-${i + 1}`,
          description: `High-quality ${productNames[i % productNames.length].toLowerCase()} from vendor ${vendors[v].name}`,
          category: productCategories[i % productCategories.length],
          sku: `SKU-${v + 1}-${String(i + 1).padStart(3, '0')}`,
          barcode: `${String(v + 1).padStart(2, '0')}${String(i + 1).padStart(8, '0')}`,
          price: Math.floor(Math.random() * 200) + 10,
          cost: Math.floor(Math.random() * 100) + 5,
          isActive: i < 23, // 2 inactive products per vendor
        },
      });

      // Create stock location for each product
      await prisma.productStockLocation.create({
        data: {
          productId: product.id,
          locationName: 'Main Store',
          quantity: Math.floor(Math.random() * 100) + 10,
        },
      });

      products.push(product);
    }
  }

  console.log('✅ 300 Products created (25 per vendor)');

  // 8. Create 20 Sales per vendor (240 total)
  for (let v = 0; v < vendors.length; v++) {
    const vendorProducts = products.filter(p => p.vendorId === vendors[v].id);
    const vendorCustomers = customers.filter(c => c.vendorId === vendors[v].id);
    const vendorCashiers = users.filter(u => u.vendorId === vendors[v].id && u.role === 'CASHIER');

    for (let i = 0; i < 20; i++) {
      const customer = vendorCustomers[Math.floor(Math.random() * vendorCustomers.length)];
      const cashier = vendorCashiers[Math.floor(Math.random() * vendorCashiers.length)] || users.find(u => u.vendorId === vendors[v].id);
      
      const subtotal = Math.floor(Math.random() * 200) + 20;
      const tax = subtotal * 0.08;
      const total = subtotal + tax;

      const sale = await prisma.sale.create({
        data: {
          vendorId: vendors[v].id,
          customerId: customer?.id,
          cashierId: cashier?.id,
          receiptNumber: `RCP-${v + 1}-${String(i + 1).padStart(4, '0')}`,
          subtotal,
          tax,
          total,
          paid: total,
          paymentMethod: ['CASH', 'CARD', 'DIGITAL'][Math.floor(Math.random() * 3)],
          notes: i % 5 === 0 ? 'Customer requested receipt via email' : null,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        },
      });

      // Create 1-5 sale items per sale
      const itemCount = Math.floor(Math.random() * 5) + 1;
      for (let j = 0; j < itemCount; j++) {
        const product = vendorProducts[Math.floor(Math.random() * vendorProducts.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        
        await prisma.saleItem.create({
          data: {
            saleId: sale.id,
            productId: product.id,
            quantity,
            price: product.price,
            total: product.price * quantity,
          },
        });
      }
    }
  }

  console.log('✅ 240 Sales created (20 per vendor)');

  // 9. Create 10 Purchases per vendor (120 total)
  for (let v = 0; v < vendors.length; v++) {
    const vendorSuppliers = suppliers.filter(s => s.vendorId === vendors[v].id);
    const vendorProducts = products.filter(p => p.vendorId === vendors[v].id);

    for (let i = 0; i < 10; i++) {
      const supplier = vendorSuppliers[Math.floor(Math.random() * vendorSuppliers.length)];
      const subtotal = Math.floor(Math.random() * 1000) + 100;
      const tax = subtotal * 0.08;
      const total = subtotal + tax;

      const purchase = await prisma.purchase.create({
        data: {
          vendorId: vendors[v].id,
          supplierId: supplier.id,
          purchaseOrderNumber: `PO-${v + 1}-${String(i + 1).padStart(4, '0')}`,
          subtotal,
          tax,
          total,
          status: ['PENDING', 'RECEIVED', 'CANCELLED'][Math.floor(Math.random() * 3)],
          expectedDeliveryDate: new Date(Date.now() + Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000),
        },
      });

      // Create 1-8 purchase items per purchase
      const itemCount = Math.floor(Math.random() * 8) + 1;
      for (let j = 0; j < itemCount; j++) {
        const product = vendorProducts[Math.floor(Math.random() * vendorProducts.length)];
        const quantity = Math.floor(Math.random() * 20) + 1;
        
        await prisma.purchaseItem.create({
          data: {
            purchaseId: purchase.id,
            productId: product.id,
            quantity,
            unitCost: product.cost,
            totalCost: product.cost * quantity,
          },
        });
      }
    }
  }

  console.log('✅ 120 Purchases created (10 per vendor)');

  // 10. Create 5 Stock Takes per vendor (60 total)
  for (let v = 0; v < vendors.length; v++) {
    const vendorProducts = products.filter(p => p.vendorId === vendors[v].id);

    for (let i = 0; i < 5; i++) {
      const stockTake = await prisma.stockTake.create({
        data: {
          vendorId: vendors[v].id,
          name: `Stock Take ${i + 1} - ${new Date().getFullYear()}`,
          status: ['IN_PROGRESS', 'COMPLETED'][Math.floor(Math.random() * 2)],
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
        },
      });

      // Create stock take items for random products
      const itemCount = Math.floor(Math.random() * 15) + 5;
      for (let j = 0; j < itemCount; j++) {
        const product = vendorProducts[Math.floor(Math.random() * vendorProducts.length)];
        const expectedQuantity = Math.floor(Math.random() * 100) + 10;
        const actualQuantity = expectedQuantity + Math.floor(Math.random() * 20) - 10;
        
        await prisma.stockTakeItem.create({
          data: {
            stockTakeId: stockTake.id,
            productId: product.id,
            expectedQuantity,
            actualQuantity: stockTake.status === 'COMPLETED' ? actualQuantity : null,
            variance: stockTake.status === 'COMPLETED' ? actualQuantity - expectedQuantity : null,
          },
        });
      }
    }
  }

  console.log('✅ 60 Stock Takes created (5 per vendor)');

  // 11. Create Notifications (10 per vendor = 120 total)
  const notificationTypes = ['LOW_STOCK', 'SALE_COMPLETED', 'PURCHASE_RECEIVED', 'SYSTEM_UPDATE', 'PAYMENT_REMINDER'];
  const notificationMessages = [
    'Low stock alert for product',
    'Sale completed successfully',
    'Purchase order received',
    'System update available',
    'Payment reminder for subscription'
  ];

  for (let v = 0; v < vendors.length; v++) {
    const vendorUsers = users.filter(u => u.vendorId === vendors[v].id);
    
    for (let i = 0; i < 10; i++) {
      const user = vendorUsers[Math.floor(Math.random() * vendorUsers.length)];
      const typeIndex = i % notificationTypes.length;
      
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: notificationTypes[typeIndex],
          title: `${notificationMessages[typeIndex]} #${i + 1}`,
          message: `This is a detailed notification message about ${notificationMessages[typeIndex].toLowerCase()} for your attention.`,
          isRead: Math.random() > 0.3, // 70% read notifications
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log('✅ 120 Notifications created (10 per vendor)');

  console.log('🎉 Database seeding completed successfully!');
  console.log(`
📊 Summary:
- 1 SuperAdmin
- 12 Vendors with settings
- 27 Users (12 vendors + 15 cashiers)
- 15 Support tickets
- 240 Customers (20 per vendor)
- 180 Suppliers (15 per vendor)
- 300 Products with stock (25 per vendor)
- 240 Sales with items (20 per vendor)
- 120 Purchases with items (10 per vendor)
- 60 Stock takes with items (5 per vendor)
- 120 Notifications (10 per vendor)

🔐 All passwords set to: 12345678
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
