const https = require('https');

const BASE_URL = 'workshop-project-layanan-publik-c86hvanmz.vercel.app';

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Script/1.0'
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Testing API Endpoints...\n');

  try {
    // Test 1: Check if API is accessible
    console.log('1️⃣ Testing API accessibility...');
    const response1 = await makeRequest('/api/submissions');
    console.log(`   Status: ${response1.statusCode}`);
    console.log(`   Headers:`, response1.headers);
    console.log('   ✅ API accessible\n');
  } catch (error) {
    console.log('   ❌ API not accessible:', error.message, '\n');
  }

  try {
    // Test 2: Test POST method
    console.log('2️⃣ Testing POST method...');
    const testData = {
      nama: "Test User",
      nik: "1234567890123456",
      email: "test@example.com",
      no_wa: "08123456789",
      jenis_layanan: "KTP",
      consent: true
    };

    const response2 = await makeRequest('/api/submissions', 'POST', testData);
    console.log(`   Status: ${response2.statusCode}`);
    console.log(`   Method: POST`);
    
    if (response2.statusCode >= 200 && response2.statusCode < 300) {
      console.log('   ✅ POST successful');
      console.log('   Response:', response2.data);
    } else {
      console.log('   ❌ POST failed');
      console.log('   Error:', response2.data);
    }
    console.log('');
  } catch (error) {
    console.log('   ❌ POST request failed:', error.message, '\n');
  }

  try {
    // Test 3: Test GET method (should not be allowed)
    console.log('3️⃣ Testing GET method (should fail)...');
    const response3 = await makeRequest('/api/submissions');
    console.log(`   Status: ${response3.statusCode}`);
    console.log(`   Method: GET`);
    
    if (response3.statusCode === 405) {
      console.log('   ✅ GET correctly rejected (405 Method Not Allowed)');
    } else {
      console.log('   ⚠️ Unexpected response for GET');
    }
    console.log('');
  } catch (error) {
    console.log('   ❌ GET request failed:', error.message, '\n');
  }

  console.log('🏁 API testing completed!');
}

// Run the test
testAPI().catch(console.error);
