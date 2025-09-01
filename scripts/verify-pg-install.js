const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying pg package installation...\n');

// Check 1: Verify pg is in package.json
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const pgInDeps = packageJson.dependencies && packageJson.dependencies.pg;
  const pgHstoreInDeps = packageJson.dependencies && packageJson.dependencies['pg-hstore'];
  
  console.log('1️⃣ Package.json dependencies:');
  console.log(`   pg: ${pgInDeps ? '✅ Found' : '❌ Missing'}`);
  console.log(`   pg-hstore: ${pgHstoreInDeps ? '✅ Found' : '❌ Missing'}`);
  
  if (!pgInDeps) {
    console.log('   ⚠️ pg package not found in dependencies!');
  }
  if (!pgHstoreInDeps) {
    console.log('   ⚠️ pg-hstore package not found in dependencies!');
  }
  console.log('');
} catch (error) {
  console.log('   ❌ Error reading package.json:', error.message);
}

// Check 2: Verify pg is in node_modules
try {
  const pgPath = path.join(__dirname, '..', 'node_modules', 'pg');
  const pgExists = fs.existsSync(pgPath);
  
  console.log('2️⃣ Node modules:');
  console.log(`   pg directory: ${pgExists ? '✅ Exists' : '❌ Missing'}`);
  
  if (pgExists) {
    const packageJsonPath = path.join(pgPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const pgPackage = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      console.log(`   pg version: ${pgPackage.version}`);
    }
  }
  console.log('');
} catch (error) {
  console.log('   ❌ Error checking node_modules:', error.message);
}

// Check 3: Verify pg can be required
try {
  console.log('3️⃣ Package loading test:');
  const pg = require('pg');
  console.log(`   pg loaded: ✅ Success`);
  console.log(`   pg version: ${pg.version}`);
  console.log(`   pg.Client: ${typeof pg.Client}`);
  console.log('');
} catch (error) {
  console.log(`   ❌ Failed to load pg: ${error.message}`);
}

// Check 4: Verify pg-hstore can be required
try {
  console.log('4️⃣ pg-hstore loading test:');
  const pgHstore = require('pg-hstore');
  console.log(`   pg-hstore loaded: ✅ Success`);
  console.log(`   pg-hstore type: ${typeof pgHstore}`);
  console.log('');
} catch (error) {
  console.log(`   ❌ Failed to load pg-hstore: ${error.message}`);
}

// Check 5: Verify Sequelize can use pg
try {
  console.log('5️⃣ Sequelize + pg integration test:');
  const { Sequelize } = require('sequelize');
  
  // Test creating Sequelize instance with postgres dialect
  const testSequelize = new Sequelize('postgresql://test:test@localhost:5432/test', {
    dialect: 'postgres',
    logging: false,
  });
  
  console.log(`   Sequelize instance created: ✅ Success`);
  console.log(`   Dialect: ${testSequelize.getDialect()}`);
  console.log(`   Database: ${testSequelize.getDatabaseName()}`);
  console.log('');
} catch (error) {
  console.log(`   ❌ Failed to create Sequelize instance: ${error.message}`);
}

console.log('🏁 Verification completed!');
console.log('\n📋 Summary:');
console.log('- If all checks pass: ✅ pg is properly installed and bundled');
console.log('- If any check fails: ❌ There are issues with pg installation/bundling');
console.log('- For Vercel: Make sure to clear cache and redeploy after fixing any issues');
