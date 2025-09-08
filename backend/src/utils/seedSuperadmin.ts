import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Hash password with MD5
const hashPassword = (password: string): string => {
  return crypto.createHash('md5').update(password).digest('hex');
};

async function seedSuperadmin() {
  console.log('🌱 Creating superadmin user...');

  try {
    // Check if superadmin already exists
    const existingSuperadmin = await prisma.user.findFirst({
      where: { role: 'SUPERADMIN' }
    });

    if (existingSuperadmin) {
      console.log('⚠️  Superadmin already exists!');
      console.log('📧 Email:', existingSuperadmin.email);
      return;
    }

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

    console.log('✅ Superadmin created successfully!');
    console.log('👑 Email: superadmin@flux.com');
    console.log('🔑 Password: 12345678');
    console.log('🆔 ID:', superadmin.id);

  } catch (error) {
    console.error('❌ Error creating superadmin:', error);
    throw error;
  }
}

seedSuperadmin()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
