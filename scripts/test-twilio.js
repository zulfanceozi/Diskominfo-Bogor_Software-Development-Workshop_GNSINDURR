require("dotenv").config({ path: ".env.local" });
const { sendWhatsApp } = require("../lib/notify/twilio");
const twilio = require("twilio");

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
  const testNumber = process.argv[2] || "whatsapp:+62*********"; // Replace with your number

  console.log(`📤 Sending test message to: ${testNumber}`);
  console.log("💡 Note: If using trial account, recipient must join WhatsApp sandbox first");
  console.log("💡 Sandbox code: " + (process.env.TWILIO_WHATSAPP_FROM || "").replace("whatsapp:", ""));

  try {
    const result = await sendWhatsApp({
      to: testNumber,
      body: "Hello! This is a test message from your Workshop-Disko application. 🚀",
    });

    if (result.success) {
      console.log("✅ Test message sent successfully!");
      console.log("Message SID:", result.messageId);
      console.log("Status:", result.status);
      
      // Check message status after a delay
      console.log("\n🔄 Checking message status...");
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
      
      try {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        const message = await client.messages(result.messageId).fetch();
        
        console.log("📊 Message Details:");
        console.log("  Status:", message.status);
        console.log("  Error Code:", message.errorCode || "None");
        console.log("  Error Message:", message.errorMessage || "None");
        console.log("  Direction:", message.direction);
        console.log("  Date Created:", message.dateCreated);
        
        if (message.status === "delivered") {
          console.log("✅ Message delivered successfully!");
        } else if (message.status === "failed") {
          console.log("❌ Message failed to deliver");
          console.log("   Error:", message.errorMessage);
        } else if (message.status === "queued" || message.status === "sending") {
          console.log("⏳ Message is still being processed...");
          console.log("   This is normal for WhatsApp messages");
        }
        
      } catch (statusError) {
        console.log("⚠️  Could not check message status:", statusError.message);
      }
      
    } else {
      console.error("❌ Failed to send test message:", result.error);
      console.log("Error code:", result.code);
    }
  } catch (error) {
    console.error("❌ Error during test:", error.message);
  }
}

testTwilio();
