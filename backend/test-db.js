const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful:', result);
    
    // Test SuperAdmin creation
    console.log('Testing SuperAdmin creation...');
    const superAdmin = await prisma.user.upsert({
      where: { email: 'superadmin@flux.com' },
      update: {},
      create: {
        email: 'superadmin@flux.com',
        passwordHash: require('crypto').createHash('md5').update('12345678').digest('hex'),
        name: 'Super Admin',
        role: 'SUPERADMIN',
        isActive: true,
      },
    });
    console.log('✅ SuperAdmin created/found:', superAdmin.email);
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
