const { execSync } = require('child_process');

try {
  console.log('🌱 Starting seed process...');
  const result = execSync('npx tsx src/scripts/seedSample.ts', { 
    cwd: __dirname,
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log(result);
} catch (error) {
  console.error('❌ Seed error:', error.message);
  if (error.stdout) console.log('Stdout:', error.stdout);
  if (error.stderr) console.log('Stderr:', error.stderr);
}
