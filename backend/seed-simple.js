const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Starting database seeding with sample data...');

  const hashedPassword = hashPassword('12345678');

  try {
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

    // 2. Create 5 Vendors (simplified)
    const vendorData = [
      { name: 'TechMart Electronics', email: 'admin@techmart.com', businessType: 'Electronics', phone: '+1-555-0101', address: '123 Tech Street, Silicon Valley, CA' },
      { name: 'Fresh Foods Market', email: 'manager@freshfoods.com', businessType: 'Grocery', phone: '+1-555-0102', address: '456 Market Ave, Downtown, NY' },
      { name: 'Fashion Forward Boutique', email: 'owner@fashionforward.com', businessType: 'Clothing', phone: '+1-555-0103', address: '789 Style Blvd, Fashion District, LA' },
      { name: 'Home & Garden Center', email: 'info@homegarden.com', businessType: 'Home Improvement', phone: '+1-555-0104', address: '321 Garden Way, Suburbia, TX' },
      { name: 'Sports Zone Pro', email: 'contact@sportszone.com', businessType: 'Sports Equipment', phone: '+1-555-0105', address: '654 Athletic Dr, Sports City, FL' }
    ];

    const vendors = [];
    for (let i = 0; i < vendorData.length; i++) {
      const data = vendorData[i];
      const subscriptionPlan = i < 2 ? 'PREMIUM' : i < 4 ? 'BASIC' : 'TRIAL';
      const subscriptionStatus = 'ACTIVE';
      
      const vendor = await prisma.vendor.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          businessType: data.businessType,
          subscriptionPlan: subscriptionPlan,
          subscriptionStatus: subscriptionStatus,
          subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isApproved: true,
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
    console.log('✅ 5 Vendors created');

    // 3. Create Vendor Owner Users
    for (let i = 0; i < vendors.length; i++) {
      const vendor = vendors[i];
      await prisma.user.create({
        data: {
          email: vendor.email,
          passwordHash: hashedPassword,
          name: `${vendor.name} Owner`,
          role: 'VENDOR',
          vendorId: vendor.id,
          isActive: true,
        },
      });
    }

    // 4. Create 10 Cashiers
    const cashierNames = [
      'Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Emma Brown',
      'Frank Miller', 'Grace Taylor', 'Henry Anderson', 'Ivy Thomas', 'Jack Jackson'
    ];

    for (let i = 0; i < 10; i++) {
      const vendorIndex = i % vendors.length;
      const name = cashierNames[i];
      const user = await prisma.user.create({
        data: {
          email: `${name.toLowerCase().replace(' ', '.')}@${vendors[vendorIndex].email.split('@')[1]}`,
          passwordHash: hashedPassword,
          name: name,
          role: 'CASHIER',
          vendorId: vendors[vendorIndex].id,
          isActive: true,
        },
      });

      // Create cashier schedule
      await prisma.cashierSchedule.create({
        data: {
          userId: user.id,
          checkInTime: `${8 + (i % 4)}:00`,
          checkOutTime: `${16 + (i % 4)}:00`,
          workDays: [1, 2, 3, 4, 5], // Monday to Friday
        },
      });
    }
    console.log('✅ 15 Users created (5 vendors + 10 cashiers)');

    // 5. Create 10 Support Tickets
    const ticketSubjects = [
      'Payment processing issue', 'Inventory sync problem', 'Login authentication error',
      'Receipt printer not working', 'Barcode scanner malfunction', 'Database connection timeout',
      'Customer data export request', 'Subscription upgrade inquiry', 'Tax calculation discrepancy',
      'Multi-location setup help'
    ];

    const ticketStatuses = ['OPEN', 'IN_PROGRESS', 'CLOSED'];
    const ticketPriorities = ['LOW', 'MEDIUM', 'HIGH'];

    for (let i = 0; i < 10; i++) {
      await prisma.supportTicket.create({
        data: {
          vendorId: vendors[i % vendors.length].id,
          vendorName: vendors[i % vendors.length].name,
          subject: ticketSubjects[i],
          description: `Detailed description for ${ticketSubjects[i]}. This ticket requires attention from our support team.`,
          status: ticketStatuses[i % ticketStatuses.length],
          priority: ticketPriorities[i % ticketPriorities.length],
        },
      });
    }
    console.log('✅ 10 Support tickets created');

    // 6. Create 50 Customers (10 per vendor)
    const customerFirstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Chris', 'Amy', 'Tom', 'Kate'];
    const customerLastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

    for (let v = 0; v < vendors.length; v++) {
      for (let i = 0; i < 10; i++) {
        const firstName = customerFirstNames[i % customerFirstNames.length];
        const lastName = customerLastNames[i % customerLastNames.length];
        await prisma.customer.create({
          data: {
            vendorId: vendors[v].id,
            name: `${firstName} ${lastName}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${v}.${i}@email.com`,
            phone: `+1-555-${String(v * 100 + i).padStart(4, '0')}`,
            address: `${100 + i} Customer St, City ${v + 1}`,
            loyaltyPoints: Math.floor(Math.random() * 1000),
            totalSpent: Math.floor(Math.random() * 5000),
            visitCount: Math.floor(Math.random() * 50) + 1,
          },
        });
      }
    }
    console.log('✅ 50 Customers created (10 per vendor)');

    // 7. Create 25 Suppliers (5 per vendor)
    const supplierNames = [
      'Global Electronics Supply', 'Fresh Produce Distributors', 'Fashion Wholesale Inc',
      'Home Goods Supplier', 'Sports Equipment Co'
    ];

    for (let v = 0; v < vendors.length; v++) {
      for (let i = 0; i < 5; i++) {
        await prisma.supplier.create({
          data: {
            vendorId: vendors[v].id,
            name: `${supplierNames[i]} ${v + 1}`,
            contactPerson: `Contact Person ${i + 1}`,
            email: `supplier${i + 1}.vendor${v + 1}@supply.com`,
            phone: `+1-800-${String(v * 100 + i).padStart(4, '0')}`,
            address: `${200 + i} Supplier Blvd, Industrial Zone ${v + 1}`,
          },
        });
      }
    }
    console.log('✅ 25 Suppliers created (5 per vendor)');

    // 8. Create 50 Products (10 per vendor)
    const productNames = [
      'Wireless Headphones', 'Organic Apples', 'Cotton T-Shirt', 'LED Desk Lamp', 'Basketball',
      'Programming Guide', 'Car Battery', 'Face Moisturizer', 'Dog Food', 'Coffee Beans'
    ];

    const productCategories = ['Electronics', 'Food', 'Clothing', 'Home', 'Sports', 'Books', 'Auto', 'Beauty', 'Pets', 'Beverages'];

    for (let v = 0; v < vendors.length; v++) {
      for (let i = 0; i < 10; i++) {
        const price = Math.floor(Math.random() * 200) + 10;
        const cost = Math.floor(Math.random() * 100) + 5;
        
        await prisma.product.create({
          data: {
            vendorId: vendors[v].id,
            name: `${productNames[i]} ${v + 1}-${i + 1}`,
            description: `High-quality ${productNames[i].toLowerCase()}`,
            category: productCategories[i % productCategories.length],
            sku: `SKU-${v + 1}-${String(i + 1).padStart(3, '0')}`,
            barcode: `${String(v + 1).padStart(2, '0')}${String(i + 1).padStart(8, '0')}`,
            price: price,
            costPrice: cost,
            totalStock: Math.floor(Math.random() * 100) + 10,
            isActive: true,
          },
        });
      }
    }
    console.log('✅ 50 Products created (10 per vendor)');

    console.log('🎉 Sample data seeding completed successfully!');
    console.log(`
📊 Summary:
- 1 SuperAdmin
- 5 Vendors with settings  
- 15 Users (5 vendors + 10 cashiers)
- 10 Support tickets
- 50 Customers (10 per vendor)
- 25 Suppliers (5 per vendor) 
- 50 Products (10 per vendor)

🔐 All passwords set to: 12345678

Login credentials:
- SuperAdmin: superadmin@flux.com / 12345678
- Vendors: Use vendor email addresses / 12345678
- Cashiers: Use cashier email addresses / 12345678
    `);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
