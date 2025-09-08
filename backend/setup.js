const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log(' Setting up Flux POS Backend...\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log(' .env file not found. Please create it first.');
  process.exit(1);
}

try {
  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Generate Prisma client
  console.log('\n🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Check database connection
  console.log('\n🗄️ Checking database connection...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });

  // Seed database
  console.log('\n Seeding database with demo data...');
  execSync('npm run db:seed', { stdio: 'inherit' });

  console.log('\nBackend setup complete!');
  console.log('\n Next steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Backend will be available at http://localhost:5000');
  console.log('3. Test login with: vendor@demo.com / password123');

} catch (error) {
  console.error('\n Setup failed:', error.message);
  process.exit(1);
}
