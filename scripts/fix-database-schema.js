const { Sequelize, DataTypes } = require("sequelize");

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: process.env.DATABASE_URL.includes("render.com")
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
  logging: console.log,
});

async function fixDatabaseSchema() {
  try {
    console.log("🔧 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Check if created_at column exists and has null values
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'submissions' AND column_name = 'created_at'
    `);

    if (results.length === 0) {
      console.log("❌ created_at column does not exist in submissions table");
      return;
    }

    const column = results[0];
    console.log("📋 Current created_at column info:", column);

    // Check for null values
    const [nullCount] = await sequelize.query(`
      SELECT COUNT(*) as null_count 
      FROM submissions 
      WHERE created_at IS NULL
    `);

    console.log(
      `📊 Found ${nullCount[0].null_count} rows with null created_at`
    );

    if (nullCount[0].null_count > 0) {
      console.log("🔧 Fixing null created_at values...");

      // Update null created_at values to current timestamp
      await sequelize.query(`
        UPDATE submissions 
        SET created_at = NOW() 
        WHERE created_at IS NULL
      `);

      console.log("✅ Updated null created_at values");
    }

    // Now try to add NOT NULL constraint
    try {
      console.log("🔧 Adding NOT NULL constraint to created_at...");
      await sequelize.query(`
        ALTER TABLE submissions 
        ALTER COLUMN created_at SET NOT NULL
      `);
      console.log("✅ NOT NULL constraint added successfully");
    } catch (constraintError) {
      console.log(
        "⚠️ Could not add NOT NULL constraint:",
        constraintError.message
      );
    }

    console.log("🎉 Database schema fix completed!");
  } catch (error) {
    console.error("❌ Error fixing database schema:", error);
  } finally {
    await sequelize.close();
  }
}

// Run the fix
if (require.main === module) {
  fixDatabaseSchema();
}

module.exports = { fixDatabaseSchema };
