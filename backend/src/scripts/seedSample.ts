import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return createHash('md5').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Starting database seeding with sample data...');

  const hashedPassword = hashPassword('12345678');

  // Clear existing data (except SuperAdmin)
  console.log('🧹 Cleaning existing data...');
  await prisma.supportTicket.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.cashierSchedule.deleteMany({});
  await prisma.user.deleteMany({ where: { role: { not: 'SUPERADMIN' } } });
  await prisma.vendorSettings.deleteMany({});
  await prisma.vendor.deleteMany({});
  console.log('✅ Existing data cleared');

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

  const vendors = [];
  for (let i = 0; i < vendorData.length; i++) {
    const data = vendorData[i];
    const subscriptionPlan = i < 3 ? 'PREMIUM' : i < 6 ? 'STANDARD' : i < 9 ? 'BASIC' : 'TRIAL';
    const subscriptionStatus = i < 10 ? 'ACTIVE' : 'TRIALING';
    
    const vendor = await prisma.vendor.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        businessType: data.businessType,
        subscriptionPlan: subscriptionPlan as any,
        subscriptionStatus: subscriptionStatus as any,
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

  // 3. Create Vendor Owner Users
  const users = [];
  for (let i = 0; i < vendors.length; i++) {
    const vendor = vendors[i];
    const user = await prisma.user.create({
      data: {
        email: vendor.email,
        passwordHash: hashedPassword,
        name: `${vendor.name} Owner`,
        role: 'VENDOR',
        vendorId: vendor.id,
        isActive: true,
      },
    });
    users.push(user);
  }

  // 4. Create 15 Cashiers
  const cashierNames = [
    'Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Emma Brown',
    'Frank Miller', 'Grace Taylor', 'Henry Anderson', 'Ivy Thomas', 'Jack Jackson',
    'Kate White', 'Leo Harris', 'Mia Martin', 'Noah Thompson', 'Olivia Garcia'
  ];

  for (let i = 0; i < 15; i++) {
    const vendorIndex = i % vendors.length;
    const name = cashierNames[i];
    const user = await prisma.user.create({
      data: {
        email: `${name.toLowerCase().replace(' ', '.')}@${vendors[vendorIndex].email.split('@')[1]}`,
        passwordHash: hashedPassword,
        name: name,
        role: 'CASHIER',
        vendorId: vendors[vendorIndex].id,
        isActive: i < 13,
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

    users.push(user);
  }

  console.log('✅ 27 Users created (12 vendors + 15 cashiers)');

  // 5. Create 15 Support Tickets
  const ticketSubjects = [
    'Payment processing issue', 'Inventory sync problem', 'Login authentication error',
    'Receipt printer not working', 'Barcode scanner malfunction', 'Database connection timeout',
    'Customer data export request', 'Subscription upgrade inquiry', 'Tax calculation discrepancy',
    'Multi-location setup help', 'API integration support', 'Mobile app sync issue',
    'Backup and restore question', 'Performance optimization', 'Security audit request'
  ];

  const ticketStatuses = ['OPEN', 'IN_PROGRESS', 'CLOSED'];
  const ticketPriorities = ['LOW', 'MEDIUM', 'HIGH'];

  for (let i = 0; i < 15; i++) {
    await prisma.supportTicket.create({
      data: {
        vendorId: vendors[i % vendors.length].id,
        vendorName: vendors[i % vendors.length].name,
        subject: ticketSubjects[i],
        description: `Detailed description for ${ticketSubjects[i]}. This ticket requires attention from our support team.`,
        status: ticketStatuses[i % ticketStatuses.length] as any,
        priority: ticketPriorities[i % ticketPriorities.length] as any,
      },
    });
  }

  console.log('✅ 15 Support tickets created');

  // 6. Create 20 Customers per vendor
  const customerFirstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Chris', 'Amy', 'Tom', 'Kate'];
  const customerLastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

  for (let v = 0; v < vendors.length; v++) {
    for (let i = 0; i < 20; i++) {
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

  console.log('✅ 240 Customers created (20 per vendor)');

  // 7. Create 15 Suppliers per vendor
  const supplierNames = [
    'Global Electronics Supply', 'Fresh Produce Distributors', 'Fashion Wholesale Inc',
    'Home Goods Supplier', 'Sports Equipment Co', 'Book Distribution Network',
    'Auto Parts Warehouse', 'Beauty Products Supply', 'Pet Food Distributors',
    'Coffee Bean Importers', 'Toy Manufacturing Ltd', 'Office Supply Chain',
    'Tech Components Inc', 'Organic Foods Supply', 'Clothing Manufacturers'
  ];

  for (let v = 0; v < vendors.length; v++) {
    for (let i = 0; i < 15; i++) {
      await prisma.supplier.create({
        data: {
          vendorId: vendors[v].id,
          name: `${supplierNames[i % supplierNames.length]} ${v + 1}`,
          contactPerson: `Contact Person ${i + 1}`,
          email: `supplier${i + 1}.vendor${v + 1}@supply.com`,
          phone: `+1-800-${String(v * 100 + i).padStart(4, '0')}`,
          address: `${200 + i} Supplier Blvd, Industrial Zone ${v + 1}`,
        },
      });
    }
  }

  console.log('✅ 180 Suppliers created (15 per vendor)');

  // 8. Create 25 Products per vendor
  const productNames = [
    'Wireless Headphones', 'Organic Apples', 'Cotton T-Shirt', 'LED Desk Lamp', 'Basketball',
    'Programming Guide', 'Car Battery', 'Face Moisturizer', 'Dog Food', 'Coffee Beans',
    'Building Blocks', 'Notebook Set', 'Smartphone Case', 'Energy Drink', 'Yoga Mat',
    'Cooking Pan', 'Running Shoes', 'Mystery Novel', 'Phone Charger', 'Shampoo',
    'Cat Toy', 'Green Tea', 'Puzzle Game', 'Pen Set', 'Tablet Stand'
  ];

  const productCategories = ['Electronics', 'Food', 'Clothing', 'Home', 'Sports', 'Books', 'Auto', 'Beauty', 'Pets', 'Beverages', 'Toys', 'Office'];

  for (let v = 0; v < vendors.length; v++) {
    for (let i = 0; i < 25; i++) {
      const price = Math.floor(Math.random() * 200) + 10;
      const cost = Math.floor(Math.random() * 100) + 5;
      
      await prisma.product.create({
        data: {
          vendorId: vendors[v].id,
          name: `${productNames[i % productNames.length]} ${v + 1}-${i + 1}`,
          description: `High-quality ${productNames[i % productNames.length].toLowerCase()}`,
          category: productCategories[i % productCategories.length],
          sku: `SKU-${v + 1}-${String(i + 1).padStart(3, '0')}`,
          barcode: `${String(v + 1).padStart(2, '0')}${String(i + 1).padStart(8, '0')}`,
          price: price,
          costPrice: cost,
          totalStock: Math.floor(Math.random() * 100) + 10,
          isActive: i < 23,
        },
      });
    }
  }

  console.log('✅ 300 Products created (25 per vendor)');

  console.log('🎉 Sample data seeding completed successfully!');
  console.log(`
📊 Summary:
- 1 SuperAdmin
- 12 Vendors with settings  
- 27 Users (12 vendors + 15 cashiers)
- 15 Support tickets
- 240 Customers (20 per vendor)
- 180 Suppliers (15 per vendor) 
- 300 Products (25 per vendor)

🔐 All passwords set to: 12345678

Login credentials:
- SuperAdmin: superadmin@flux.com / 12345678
- Vendors: Use vendor email addresses / 12345678
- Cashiers: Use cashier email addresses / 12345678
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
