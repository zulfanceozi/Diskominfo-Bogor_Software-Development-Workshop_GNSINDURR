const { Sequelize, DataTypes } = require("sequelize");
const fs = require("fs");
const path = require("path");

// Check if .env file exists
const envPath = path.join(__dirname, "..", ".env");
if (!fs.existsSync(envPath)) {
  console.log("❌ .env file not found!");
  console.log("📝 Please create a .env file with your database configuration.");
  console.log("💡 You can copy from .env.example");
  process.exit(1);
}

// Load environment variables
require("dotenv").config({ path: envPath });

async function setupLocalDatabase() {
  console.log("🚀 Setting up local database...");

  let sequelize;

  // Check if DATABASE_URL is provided
  if (process.env.DATABASE_URL) {
    console.log("📊 Using PostgreSQL from DATABASE_URL...");

    // Determine if it's local or production
    const isLocal =
      process.env.DATABASE_URL.includes("localhost") ||
      process.env.DATABASE_URL.includes("127.0.0.1") ||
      process.env.DATABASE_URL.includes("postgres://");

    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      dialectOptions: isLocal
        ? {}
        : {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          },
      logging: console.log,
    });
  } else {
    console.log("📊 Using SQLite for local development...");

    // Create SQLite database in project root
    const dbPath = path.join(__dirname, "..", "database.sqlite");
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: dbPath,
      logging: console.log,
    });
  }

  // Define models
  const Submission = sequelize.define(
    "Submission",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      tracking_code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      nama: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nik: {
        type: DataTypes.STRING(16),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      no_wa: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      jenis_layanan: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "PENGAJUAN_BARU",
          "DIPROSES",
          "SELESAI",
          "DITOLAK"
        ),
        defaultValue: "PENGAJUAN_BARU",
        allowNull: false,
      },
    },
    {
      tableName: "submissions",
      timestamps: true,
    }
  );

  const NotificationLog = sequelize.define(
    "NotificationLog",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      submission_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "submissions",
          key: "id",
        },
      },
      channel: {
        type: DataTypes.ENUM("WHATSAPP", "EMAIL"),
        allowNull: false,
      },
      send_status: {
        type: DataTypes.ENUM("SUCCESS", "FAILED"),
        allowNull: false,
      },
      payload: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      tableName: "notification_logs",
      timestamps: true,
      updatedAt: false,
    }
  );

  // Define relationships
  Submission.hasMany(NotificationLog, { foreignKey: "submission_id" });
  NotificationLog.belongsTo(Submission, { foreignKey: "submission_id" });

  try {
    // Test connection
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    // Sync models (create tables)
    await sequelize.sync({ force: false, alter: true });
    console.log("✅ Database tables synchronized successfully.");

    // Create sample data for testing
    const sampleSubmission = await Submission.create({
      tracking_code: "LP-20241201-00001",
      nama: "John Doe",
      nik: "1234567890123456",
      email: "john@example.com",
      no_wa: "+6281234567890",
      jenis_layanan: "KTP",
      status: "PENGAJUAN_BARU",
    });

    console.log("✅ Sample data created successfully.");
    console.log(`📝 Sample tracking code: ${sampleSubmission.tracking_code}`);
    console.log(
      `📝 Sample NIK last 4 digits: ${sampleSubmission.nik.slice(-4)}`
    );

    console.log("\n🎉 Database setup completed successfully!");
    console.log("🚀 You can now run: npm run dev");
  } catch (error) {
    console.error("❌ Database setup failed:", error.message);

    if (error.message.includes("ECONNREFUSED")) {
      console.log("\n💡 Troubleshooting tips:");
      console.log("1. Make sure PostgreSQL is running");
      console.log("2. Check your DATABASE_URL in .env file");
      console.log(
        "3. For local PostgreSQL, try: DATABASE_URL=postgresql://username:password@localhost:5432/database_name"
      );
    }

    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

setupLocalDatabase();
