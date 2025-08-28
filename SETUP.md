# 🚀 Local Database Setup Guide

## Quick Start

### Option 1: SQLite (Recommended for beginners)

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Create .env file:**

   ```bash
   cp .env.example .env
   ```

3. **Leave DATABASE_URL empty in .env:**

   ```env
   DATABASE_URL=
   ```

4. **Setup database:**

   ```bash
   npm run setup-db
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

### Option 2: Local PostgreSQL

1. **Install PostgreSQL:**

   - **Windows:** Download from https://www.postgresql.org/download/windows/
   - **macOS:** `brew install postgresql`
   - **Ubuntu:** `sudo apt-get install postgresql postgresql-contrib`

2. **Start PostgreSQL service:**

   - **Windows:** PostgreSQL service should start automatically
   - **macOS:** `brew services start postgresql`
   - **Ubuntu:** `sudo systemctl start postgresql`

3. **Create database:**

   ```bash
   # Connect to PostgreSQL
   psql -U postgres

   # Create database
   CREATE DATABASE layanan_publik;

   # Create user (optional)
   CREATE USER layanan_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE layanan_publik TO layanan_user;

   # Exit
   \q
   ```

4. **Update .env file:**

   ```env
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/layanan_publik
   ```

5. **Setup database:**

   ```bash
   npm run setup-db
   ```

6. **Start development server:**
   ```bash
   npm run dev
   ```

## Troubleshooting

### Database Connection Issues

**Error: "ECONNREFUSED"**

- Make sure PostgreSQL is running
- Check if port 5432 is available
- Verify username/password in DATABASE_URL

**Error: "Please install pg package manually"**

- Run: `npm install pg`
- Make sure you're using the correct Node.js version

**Error: "Database does not exist"**

- Create the database first: `CREATE DATABASE layanan_publik;`

### Form Text Not Visible

The form text color issue has been fixed in `app/globals.css`. If you still see issues:

1. Clear browser cache
2. Restart development server
3. Check if you have any browser extensions affecting CSS

### Sample Data

After running `npm run setup-db`, you'll get sample data:

- **Tracking Code:** `LP-20241201-00001`
- **NIK Last 4 digits:** `3456`

You can use these to test the status check feature.

## Environment Variables

### Required for Local Development

```env
# Database (choose one)
DATABASE_URL=postgresql://username:password@localhost:5432/layanan_publik
# OR leave empty for SQLite
DATABASE_URL=

# Application
APP_BASE_URL=http://localhost:3000
NODE_ENV=development
```

### Optional (for notifications)

```env
# Twilio WhatsApp
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Resend Email
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
```

## Testing the Application

1. **Public Form:**

   - Go to http://localhost:3000/public
   - Fill out the form and submit
   - Note the tracking code

2. **Status Check:**

   - Use the tracking code from step 1
   - Enter last 4 digits of NIK
   - Verify status is displayed

3. **Admin Dashboard:**
   - Go to http://localhost:3000/admin/login
   - Username: `admin`, Password: `admin123`
   - View and manage submissions

## File Structure

```
├── scripts/
│   ├── setup-local-db.js    # Database setup script
│   └── init-db.js          # Legacy init script
├── lib/
│   └── sequelize.js        # Database configuration
├── .env                    # Environment variables
└── database.sqlite         # SQLite database (if used)
```

## Next Steps

1. **Add real data:** Replace sample data with real submissions
2. **Configure notifications:** Set up Twilio and Resend for real notifications
3. **Deploy:** Use the main README.md for production deployment instructions
