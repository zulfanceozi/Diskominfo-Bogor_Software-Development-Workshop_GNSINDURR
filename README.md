# Layanan Publik PWA

Sistem Layanan Publik Berbasis Progressive Web App (PWA) dengan fitur pengajuan layanan, tracking status, dan notifikasi WhatsApp/Email.

## 🚀 Fitur

- **PWA (Progressive Web App)** - Dapat diinstall di mobile/desktop
- **Pengajuan Layanan** - Form pengajuan dengan validasi
- **Tracking Status** - Cek status dengan kode tracking + NIK
- **Admin Dashboard** - Kelola pengajuan dengan Ant Design
- **Notifikasi** - WhatsApp via Twilio + Email via Resend
- **Responsive Design** - Mobile-first dengan TailwindCSS
- **Database** - PostgreSQL dengan Sequelize ORM

## 📋 Prerequisites

Sebelum memulai, pastikan Anda telah menginstall:

- **Node.js** (v18 atau lebih baru)
- **Git**
- **Cursor** (atau VS Code)
- **PostgreSQL** (untuk development lokal) atau akun **Render**

## 🛠️ Setup Step-by-Step

### 1. Clone Repository

```bash
git clone <repository-url>
cd Workshop-Disko
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database (Render PostgreSQL)

1. Buka [Render Dashboard](https://dashboard.render.com)
2. Klik "New" → "PostgreSQL"
3. Isi form:
   - **Name**: `layanan-publik-db`
   - **Database**: `layanan_publik`
   - **User**: `layanan_user`
   - **Region**: Pilih yang terdekat
4. Klik "Create Database"
5. Copy **External Database URL** untuk digunakan di `.env`

### 4. Setup Twilio WhatsApp Sandbox

1. Buka [Twilio Console](https://console.twilio.com)
2. Daftar/login ke akun Twilio
3. Buka **Messaging** → **Try it out** → **Send a WhatsApp message**
4. Scan QR code dengan WhatsApp Anda
5. Kirim pesan `join <kode-join>` ke nomor Twilio
6. Copy **Account SID** dan **Auth Token** dari dashboard

### 5. Setup Resend Email

1. Buka [Resend Dashboard](https://resend.com)
2. Daftar/login ke akun Resend
3. Verifikasi domain email Anda
4. Copy **API Key** dari dashboard

### 6. Environment Variables

1. Copy `env.example` ke `.env`:

```bash
cp env.example .env
```

2. Edit `.env` dengan konfigurasi Anda:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database_name

# Application Configuration
APP_BASE_URL=http://localhost:3000

# Twilio Configuration (WhatsApp)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Resend Configuration (Email)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com

# Optional: Node Environment
NODE_ENV=development
```

### 7. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 🧪 Testing

### Test Public Flow

1. **Buat Pengajuan**:

   - Buka `/public`
   - Pilih tab "Pengajuan Baru"
   - Isi form dengan data valid
   - Submit dan catat kode tracking

2. **Cek Status**:
   - Pilih tab "Cek Status"
   - Masukkan kode tracking + 4 digit terakhir NIK
   - Verifikasi data yang ditampilkan

### Test Admin Flow

1. **Login Admin**:

   - Buka `/admin/login`
   - Username: `admin`, Password: `admin123`

2. **Kelola Pengajuan**:
   - Lihat daftar pengajuan
   - Ubah status via dropdown
   - Verifikasi notifikasi terkirim

## 🚀 Deployment ke Vercel

### 1. Push ke GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy di Vercel

1. Buka [Vercel Dashboard](https://vercel.com)
2. Klik "New Project"
3. Import repository dari GitHub
4. Konfigurasi environment variables:
   - `DATABASE_URL`
   - `APP_BASE_URL` (URL Vercel)
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_FROM`
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
5. Klik "Deploy"

### 3. Update APP_BASE_URL

Setelah deploy, update `APP_BASE_URL` di Vercel environment variables dengan URL production.

## 📱 PWA Features

### Install PWA

1. Buka aplikasi di Chrome/Edge mobile
2. Tap menu (⋮) → "Add to Home Screen"
3. PWA akan terinstall seperti aplikasi native

### Offline Support

- Service worker menyimpan cache untuk offline access
- Form pengajuan dapat diisi offline
- Data akan sync saat online kembali

## 🔧 Troubleshooting

### Database Connection Error

```bash
# Cek koneksi database
npm run dev
# Lihat error di console
```

**Solusi**:

- Pastikan `DATABASE_URL` benar
- Cek firewall/network
- Verifikasi SSL settings

### Twilio WhatsApp Error

**Error**: "The 'From' phone number is not verified"

**Solusi**:

- Pastikan sudah join Twilio sandbox
- Gunakan format `whatsapp:+14155238886`
- Cek Account SID dan Auth Token

### Resend Email Error

**Error**: "Domain not verified"

**Solusi**:

- Verifikasi domain di Resend dashboard
- Gunakan domain yang sudah diverifikasi
- Cek API key

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── (landing)/         # Landing page
│   ├── public/            # Public services
│   ├── admin/             # Admin dashboard
│   └── api/               # API routes
├── lib/                   # Utilities
│   ├── sequelize.js       # Database setup
│   ├── phone.js           # Phone utilities
│   └── notify/            # Notification services
├── public/                # Static files
│   ├── manifest.json      # PWA manifest
│   └── service-worker.js  # Service worker
└── styles/                # CSS files
```

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

Untuk pertanyaan atau bantuan:

- Email: support@example.com
- WhatsApp: +62xxx-xxxx-xxxx
- GitHub Issues: [Create Issue](https://github.com/username/repo/issues)

---

**Workshop-Friendly System** - Dibuat untuk memudahkan pembelajaran dan workshop development.
