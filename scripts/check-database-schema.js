const { Sequelize } = require("sequelize");

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: process.env.DATABASE_URL.includes("render.com")
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
  logging: console.log,
});

async function checkDatabaseSchema() {
  try {
    console.log("🔧 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Check submissions table structure
    console.log("\n📋 Checking submissions table structure...");
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'submissions'
      ORDER BY ordinal_position
    `);

    console.log("Columns in submissions table:");
    columns.forEach((col) => {
      console.log(
        `  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`
      );
    });

    // Check if table exists
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log("\n📋 All tables in database:");
    tables.forEach((table) => {
      console.log(`  - ${table.table_name}`);
    });

    // Check sample data
    console.log("\n📊 Checking sample data...");
    try {
      const [sampleData] = await sequelize.query(`
        SELECT * FROM submissions LIMIT 1
      `);

      if (sampleData.length > 0) {
        console.log("Sample submission data:");
        console.log(JSON.stringify(sampleData[0], null, 2));
      } else {
        console.log("No submissions found in table");
      }
    } catch (dataError) {
      console.log("❌ Error reading data:", dataError.message);
    }
  } catch (error) {
    console.error("❌ Error checking database schema:", error);
  } finally {
    await sequelize.close();
  }
}

// Run the check
if (require.main === module) {
  checkDatabaseSchema();
}

module.exports = { checkDatabaseSchema };
