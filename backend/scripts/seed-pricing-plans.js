const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const pricingPlans = [
  {
    name: 'Trial',
    price: 0,
    duration: 30,
    features: ['Basic POS', 'Up to 100 products', 'Email support'],
    isActive: true
  },
  {
    name: 'Basic',
    price: 29.99,
    duration: 30,
    features: ['Full POS', 'Up to 1000 products', 'Email support', 'Basic analytics'],
    isActive: true
  },
  {
    name: 'Premium',
    price: 59.99,
    duration: 30,
    features: ['Full POS', 'Unlimited products', 'Priority support', 'Advanced analytics', 'Multi-location'],
    isActive: true
  },
  {
    name: 'Enterprise',
    price: 99.99,
    duration: 30,
    features: ['Full POS', 'Unlimited products', '24/7 support', 'Custom analytics', 'Multi-location', 'API access'],
    isActive: true
  }
];

async function seedPricingPlans() {
  try {
    console.log('🌱 Seeding pricing plans...');

    // Check if pricing plans already exist
    const existingPlans = await prisma.pricingPlan.count();
    
    if (existingPlans > 0) {
      console.log(`ℹ️  Found ${existingPlans} existing pricing plans. Skipping seed.`);
      return;
    }

    // Create pricing plans
    for (const plan of pricingPlans) {
      await prisma.pricingPlan.create({
        data: plan
      });
      console.log(`✅ Created pricing plan: ${plan.name}`);
    }

    console.log('🎉 Pricing plans seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding pricing plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedPricingPlans()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
