require('dotenv').config();
const { sendEmail } = require('../lib/notify/email');

async function testEmail() {
  console.log('Testing email configuration...');
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set' : 'Not set');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
  
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set in .env file');
    return;
  }

  if (!process.env.EMAIL_FROM) {
    console.error('❌ EMAIL_FROM is not set in .env file');
    return;
  }

  try {
    // Override EMAIL_FROM for testing to use Resend's default domain
    const testFromEmail = 'onboarding@resend.dev';
    
    console.log('📧 Attempting to send email...');
    console.log('📤 From:', testFromEmail);
    console.log('📥 To:', 'imamtaufiq133@gmail.com');
    
    const result = await sendEmail({
      to: 'imamtaufiq133@gmail.com', // Use your verified email address
      from: testFromEmail,
      subject: 'Test Email from Layanan Publik PWA',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify Resend configuration.</p>
        <p>If you receive this email, your Resend setup is working correctly!</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
        <p><strong>From:</strong> ${testFromEmail}</p>
        <p><strong>To:</strong> imamtaufiq133@gmail.com</p>
      `
    });

    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', result.messageId);
    } else {
      console.error('❌ Failed to send email:', result.error);
    }
  } catch (error) {
    console.error('❌ Error testing email:', error.message);
  }
}

testEmail();
