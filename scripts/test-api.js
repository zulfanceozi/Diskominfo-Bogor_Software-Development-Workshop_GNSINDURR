const fetch = require('node-fetch');

const BASE_URL = 'https://workshop-project-layanan-publik-c86hvanmz.vercel.app';

async function testAPI() {
  console.log('🧪 Testing API Endpoints...\n');

  // Test 1: Check if API is accessible
  try {
    console.log('1️⃣ Testing API accessibility...');
    const response = await fetch(`${BASE_URL}/api/submissions`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Method: ${response.method}`);
    console.log(`   Headers:`, Object.fromEntries(response.headers.entries()));
    console.log('   ✅ API accessible\n');
  } catch (error) {
    console.log('   ❌ API not accessible:', error.message, '\n');
  }

  // Test 2: Test POST method
  try {
    console.log('2️⃣ Testing POST method...');
    const testData = {
      nama: "Test User",
      nik: "1234567890123456",
      email: "test@example.com",
      no_wa: "08123456789",
      jenis_layanan: "KTP",
      consent: true
    };

    const response = await fetch(`${BASE_URL}/api/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log(`   Status: ${response.status}`);
    console.log(`   Method: POST`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ POST successful');
      console.log('   Response:', data);
    } else {
      const errorText = await response.text();
      console.log('   ❌ POST failed');
      console.log('   Error:', errorText);
    }
    console.log('');
  } catch (error) {
    console.log('   ❌ POST request failed:', error.message, '\n');
  }

  // Test 3: Test GET method (should not be allowed)
  try {
    console.log('3️⃣ Testing GET method (should fail)...');
    const response = await fetch(`${BASE_URL}/api/submissions`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Method: GET`);
    
    if (response.status === 405) {
      console.log('   ✅ GET correctly rejected (405 Method Not Allowed)');
    } else {
      console.log('   ⚠️ Unexpected response for GET');
    }
    console.log('');
  } catch (error) {
    console.log('   ❌ GET request failed:', error.message, '\n');
  }

  // Test 4: Check other endpoints
  try {
    console.log('4️⃣ Testing other endpoints...');
    
    // Test admin submissions
    const adminResponse = await fetch(`${BASE_URL}/api/admin/submissions`);
    console.log(`   Admin submissions: ${adminResponse.status}`);
    
    // Test home page
    const homeResponse = await fetch(`${BASE_URL}/`);
    console.log(`   Home page: ${homeResponse.status}`);
    
    // Test admin page
    const adminPageResponse = await fetch(`${BASE_URL}/admin`);
    console.log(`   Admin page: ${adminPageResponse.status}`);
    
    console.log('');
  } catch (error) {
    console.log('   ❌ Other endpoints test failed:', error.message, '\n');
  }

  console.log('🏁 API testing completed!');
}

// Run the test
testAPI().catch(console.error);
