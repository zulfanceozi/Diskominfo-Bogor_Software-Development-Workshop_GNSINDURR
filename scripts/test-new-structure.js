const https = require('https');

const BASE_URL = 'workshop-project-layanan-publik-k2ockovva.vercel.app';

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Script/1.0',
        'Accept': 'application/json'
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

async function testNewStructure() {
  console.log('🧪 Testing New API Structure...\n');

  // Test 1: Test POST method with new structure
  try {
    console.log('1️⃣ Testing POST /api/submissions (new structure)...');
    const testData = {
      nama: "Test User New Structure",
      nik: "1234567890123456",
      email: "test@example.com",
      no_wa: "08123456789",
      jenis_layanan: "KTP",
      consent: true
    };

    const postResponse = await makeRequest('/api/submissions', 'POST', testData);
    
    console.log(`   Status: ${postResponse.statusCode}`);
    console.log(`   Method: POST`);
    
    if (postResponse.statusCode >= 200 && postResponse.statusCode < 300) {
      console.log('   ✅ POST successful!');
      try {
        const jsonData = JSON.parse(postResponse.data);
        console.log('   Response:', JSON.stringify(jsonData, null, 2));
      } catch (e) {
        console.log('   Response (raw):', postResponse.data);
      }
    } else {
      console.log('   ❌ POST failed');
      console.log('   Error:', postResponse.data);
    }
    console.log('');
  } catch (error) {
    console.log('   ❌ POST request failed:', error.message, '\n');
  }

  // Test 2: Test GET method (should return 405 with new structure)
  try {
    console.log('2️⃣ Testing GET /api/submissions (should fail with new structure)...');
    const getResponse = await makeRequest('/api/submissions', 'GET');
    
    console.log(`   Status: ${getResponse.statusCode}`);
    console.log(`   Method: GET`);
    
    if (getResponse.statusCode === 405) {
      console.log('   ✅ GET correctly rejected (405 Method Not Allowed)');
      try {
        const jsonData = JSON.parse(getResponse.data);
        console.log('   Response:', JSON.stringify(jsonData, null, 2));
      } catch (e) {
        console.log('   Response (raw):', getResponse.data);
      }
    } else {
      console.log('   ⚠️ Unexpected response for GET');
      console.log('   Response:', getResponse.data);
    }
    console.log('');
  } catch (error) {
    console.log('   ❌ GET request failed:', error.message, '\n');
  }

  // Test 3: Test OPTIONS method
  try {
    console.log('3️⃣ Testing OPTIONS /api/submissions...');
    const optionsResponse = await makeRequest('/api/submissions', 'OPTIONS');
    
    console.log(`   Status: ${optionsResponse.statusCode}`);
    console.log(`   Method: OPTIONS`);
    
    if (optionsResponse.statusCode === 200) {
      console.log('   ✅ OPTIONS successful (CORS preflight)');
    } else {
      console.log('   ❌ OPTIONS failed');
      console.log('   Response:', optionsResponse.data);
    }
    console.log('');
  } catch (error) {
    console.log('   ❌ OPTIONS request failed:', error.message, '\n');
  }

  // Test 4: Test PATCH method with new structure
  try {
    console.log('4️⃣ Testing PATCH /api/admin/submissions/[id]/status (new structure)...');
    
    // First, let's try to get a submission ID from admin endpoint
    const adminResponse = await makeRequest('/api/admin/submissions', 'GET');
    
    if (adminResponse.statusCode === 200) {
      try {
        const submissions = JSON.parse(adminResponse.data);
        if (submissions && submissions.length > 0) {
          const submissionId = submissions[0].id;
          console.log(`   Using submission ID: ${submissionId}`);
          
          const patchData = { status: "DIPROSES" };
          const patchResponse = await makeRequest(`/api/admin/submissions/${submissionId}/status`, 'PATCH', patchData);
          
          console.log(`   Status: ${patchResponse.statusCode}`);
          console.log(`   Method: PATCH`);
          
          if (patchResponse.statusCode >= 200 && patchResponse.statusCode < 300) {
            console.log('   ✅ PATCH successful!');
            try {
              const jsonData = JSON.parse(patchResponse.data);
              console.log('   Response:', JSON.stringify(jsonData, null, 2));
            } catch (e) {
              console.log('   Response (raw):', patchResponse.data);
            }
          } else {
            console.log('   ❌ PATCH failed');
            console.log('   Error:', patchResponse.data);
          }
        } else {
          console.log('   ⚠️ No submissions found to test PATCH');
        }
      } catch (e) {
        console.log('   ❌ Failed to parse admin response');
      }
    } else {
      console.log('   ⚠️ Cannot access admin endpoint to get submission ID');
    }
    console.log('');
  } catch (error) {
    console.log('   ❌ PATCH request failed:', error.message, '\n');
  }

  // Test 5: Test PUT method (should return 405)
  try {
    console.log('5️⃣ Testing PUT /api/submissions (should fail)...');
    const putResponse = await makeRequest('/api/submissions', 'PUT');
    
    console.log(`   Status: ${putResponse.statusCode}`);
    console.log(`   Method: PUT`);
    
    if (putResponse.statusCode === 405) {
      console.log('   ✅ PUT correctly rejected (405 Method Not Allowed)');
    } else {
      console.log('   ⚠️ Unexpected response for PUT');
      console.log('   Response:', putResponse.data);
    }
    console.log('');
  } catch (error) {
    console.log('   ❌ PUT request failed:', error.message, '\n');
  }

  console.log('🏁 New structure testing completed!');
}

// Run the test
testNewStructure().catch(console.error);
