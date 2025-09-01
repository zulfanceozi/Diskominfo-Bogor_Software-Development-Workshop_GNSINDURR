require('dotenv').config();

function verifyApiKey() {
  console.log('🔍 Verifying Resend API Key...');
  
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY is not set in .env file');
    return false;
  }
  
  console.log('📝 API Key found:', apiKey.substring(0, 10) + '...');
  
  // Check if API key starts with 're_'
  if (!apiKey.startsWith('re_')) {
    console.error('❌ Invalid API key format. Resend API keys should start with "re_"');
    return false;
  }
  
  // Check API key length (should be around 32 characters after 're_')
  if (apiKey.length < 35) {
    console.error('❌ API key seems too short. Please check if it\'s complete.');
    return false;
  }
  
  console.log('✅ API key format looks correct');
  return true;
}

// Test basic Resend connectivity
async function testResendConnection() {
  const { Resend } = require('resend');
  
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Try to get domains to test API connectivity
    const domains = await resend.domains.list();
    console.log('✅ Successfully connected to Resend API');
    console.log('📧 Available domains:', domains.data?.length || 0);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Resend API:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Resend API Key Verification\n');
  
  const keyValid = verifyApiKey();
  if (!keyValid) {
    process.exit(1);
  }
  
  console.log('\n🔗 Testing API connectivity...');
  const connected = await testResendConnection();
  
  if (connected) {
    console.log('\n🎉 Your Resend configuration is ready!');
    console.log('💡 You can now run: npm run test-email');
  } else {
    console.log('\n❌ Please check your API key and try again.');
    process.exit(1);
  }
}

main();
