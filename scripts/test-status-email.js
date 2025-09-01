require('dotenv').config();
const { sendStatusUpdateEmail } = require('../lib/notify/email');

async function testStatusEmail() {
  console.log('🧪 Testing status update email notification...\n');
  
  // Create a mock submission object
  const mockSubmission = {
    id: 'test-123',
    nama: 'Test User',
    email: 'imamtaufiq133@gmail.com', // Use your verified email
    no_wa: '+62895700805977',
    tracking_code: 'LP-TEST-12345',
    jenis_layanan: 'KTP',
    status: 'PENGAJUAN_BARU'
  };
  
  const newStatus = 'DIPROSES';
  
  console.log('📧 Sending status update email...');
  console.log('📤 To:', mockSubmission.email);
  console.log('📋 Status change:', mockSubmission.status, '→', newStatus);
  console.log('📄 Tracking code:', mockSubmission.tracking_code);
  
  try {
    const result = await sendStatusUpdateEmail(mockSubmission, newStatus);
    
    if (result.success) {
      console.log('✅ Status update email sent successfully!');
      console.log('📨 Message ID:', result.messageId);
    } else {
      console.error('❌ Failed to send status update email:', result.error);
    }
  } catch (error) {
    console.error('❌ Error testing status update email:', error.message);
  }
}

testStatusEmail();
