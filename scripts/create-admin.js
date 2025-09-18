const bcrypt = require("bcryptjs");
const { Admin, initializeDatabase } = require("../lib/sequelize");

async function createDefaultAdmin() {
  try {
    console.log("🚀 Creating default admin user...");

    // Initialize database connection
    await initializeDatabase();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      where: { email: "admin@diskominfo.bogor.go.id" },
    });

    if (existingAdmin) {
      console.log("✅ Admin user already exists");
      console.log("Username: admin");
      console.log("Password: admin123");
      process.exit(0);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Create default admin
    const admin = await Admin.create({
      email: "admin@diskominfo.bogor.go.id",
      password: hashedPassword,
    });

    console.log("✅ Default admin user created successfully!");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("Admin ID:", admin.id);

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create admin user:", error.message);
    process.exit(1);
  }
}

createDefaultAdmin();


