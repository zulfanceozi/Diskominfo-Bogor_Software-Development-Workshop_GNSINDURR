require("dotenv").config({ path: ".env.local" });
const { sendWhatsApp } = require("../lib/notify/twilio");

async function testTwilio() {
  console.log("Testing Twilio WhatsApp configuration...");

  // Check if environment variables are set
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.error("❌ Missing Twilio credentials in .env.local");
    console.log(
      "Please add your TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to .env.local"
    );
    return;
  }

  console.log("✅ Twilio credentials found");
  console.log("📱 WhatsApp From:", process.env.TWILIO_WHATSAPP_FROM);

  // Test sending a WhatsApp message
  // Replace with your actual WhatsApp number (must be in sandbox for trial)
  const testNumber = process.argv[2] || "whatsapp:+1234567890"; // Replace with your number

  console.log(`📤 Sending test message to: ${testNumber}`);

  try {
    const result = await sendWhatsApp({
      to: testNumber,
      body: "Hello! This is a test message from your Workshop-Disko application. 🚀",
    });

    if (result.success) {
      console.log("✅ Test message sent successfully!");
      console.log("Message SID:", result.messageId);
      console.log("Status:", result.status);
    } else {
      console.error("❌ Failed to send test message:", result.error);
      console.log("Error code:", result.code);
    }
  } catch (error) {
    console.error("❌ Error during test:", error.message);
  }
}

testTwilio();
