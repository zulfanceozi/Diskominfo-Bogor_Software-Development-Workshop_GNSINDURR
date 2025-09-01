const { Sequelize } = require('sequelize');

async function testPG() {
  console.log('🧪 Testing PostgreSQL connection...\n');
  
  try {
    // Test 1: Check if pg package is available
    console.log('1️⃣ Checking pg package...');
    const pg = require('pg');
    console.log('✅ pg package loaded successfully');
    console.log('Version:', pg.version);
    console.log('');
    
    // Test 2: Test Sequelize with pg
    console.log('2️⃣ Testing Sequelize with pg...');
    const testSequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    });
    
    console.log('✅ Sequelize instance created');
    
    // Test 3: Test connection
    console.log('3️⃣ Testing database connection...');
    await testSequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Test 4: Test query
    console.log('4️⃣ Testing simple query...');
    const result = await testSequelize.query('SELECT NOW() as current_time');
    console.log('✅ Query successful:', result[0][0]);
    
    await testSequelize.close();
    console.log('✅ Connection closed');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('Stack:', error.stack);
  }
  
  console.log('\n🏁 PG test completed!');
}

// Load environment variables
require('dotenv').config();

testPG().catch(console.error);
