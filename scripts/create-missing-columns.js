const { Sequelize } = require("sequelize");

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: process.env.DATABASE_URL.includes("render.com")
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
  logging: console.log,
});

async function createMissingColumns() {
  try {
    console.log("🔧 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Check current columns
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'submissions'
      ORDER BY ordinal_position
    `);

    console.log("📋 Current columns in submissions table:");
    columns.forEach((col) => {
      console.log(
        `  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`
      );
    });

    // Check if created_at exists
    const hasCreatedAt = columns.some(
      (col) => col.column_name === "created_at"
    );
    const hasUpdatedAt = columns.some(
      (col) => col.column_name === "updated_at"
    );

    if (!hasCreatedAt) {
      console.log("\n🔧 Adding created_at column...");
      await sequelize.query(`
        ALTER TABLE submissions 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `);
      console.log("✅ created_at column added");
    } else {
      console.log("✅ created_at column already exists");
    }

    if (!hasUpdatedAt) {
      console.log("\n🔧 Adding updated_at column...");
      await sequelize.query(`
        ALTER TABLE submissions 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `);
      console.log("✅ updated_at column added");
    } else {
      console.log("✅ updated_at column already exists");
    }

    // Update existing records with timestamps
    console.log("\n🔧 Updating existing records with timestamps...");
    await sequelize.query(`
      UPDATE submissions 
      SET 
        created_at = COALESCE(created_at, NOW()),
        updated_at = COALESCE(updated_at, NOW())
      WHERE created_at IS NULL OR updated_at IS NULL
    `);
    console.log("✅ Existing records updated with timestamps");

    // Verify final structure
    const [finalColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'submissions'
      ORDER BY ordinal_position
    `);

    console.log("\n📋 Final columns in submissions table:");
    finalColumns.forEach((col) => {
      console.log(
        `  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`
      );
    });

    console.log("\n🎉 Database schema fix completed!");
  } catch (error) {
    console.error("❌ Error fixing database schema:", error);
  } finally {
    await sequelize.close();
  }
}

// Run the fix
if (require.main === module) {
  createMissingColumns();
}

module.exports = { createMissingColumns };
