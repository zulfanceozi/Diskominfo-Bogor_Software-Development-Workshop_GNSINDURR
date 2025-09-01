/**
 * Test script to verify pg package loading
 * Run this to check if PostgreSQL packages are available
 */

console.log("🧪 Testing PostgreSQL package availability...\n");

try {
  // Test direct require
  console.log("1. Testing direct require...");
  const pg = require("pg");
  console.log("✅ pg package loaded successfully");
  console.log("   Version:", pg.version || "Unknown");
  console.log("   Client:", typeof pg.Client);
  console.log("   Pool:", typeof pg.Pool);
} catch (error) {
  console.log("❌ Direct require failed:", error.message);
}

try {
  // Test pg-hstore
  console.log("\n2. Testing pg-hstore...");
  const pgHstore = require("pg-hstore");
  console.log("✅ pg-hstore package loaded successfully");
} catch (error) {
  console.log("❌ pg-hstore require failed:", error.message);
}

try {
  // Test our custom wrapper
  console.log("\n3. Testing custom wrapper...");
  const pgWrapper = require("../lib/pg-wrapper");
  console.log("✅ Custom wrapper loaded successfully");
  console.log("   pg available:", pgWrapper.isAvailable());
  console.log("   pg-hstore available:", pgWrapper.isHstoreAvailable());
} catch (error) {
  console.log("❌ Custom wrapper failed:", error.message);
}

console.log("\n🏁 Test completed!");
