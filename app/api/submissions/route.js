import { NextResponse } from "next/server";
import { Submission, initializeDatabase } from "../../../lib/sequelize";
import {
  normalizePhoneNumber,
  isValidIndonesianMobile,
} from "../../../lib/phone";
import { v4 as uuidv4 } from "uuid";

// Initialize database on first request
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
};

export async function POST(request) {
  try {
    await initDB();

    const body = await request.json();
    const { nama, nik, email, no_wa, jenis_layanan, consent } = body;

    // Validation
    const errors = [];

    if (!nama || !nama.trim()) {
      errors.push("Nama wajib diisi");
    }

    if (!nik || nik.length !== 16 || !/^\d+$/.test(nik)) {
      errors.push("NIK harus 16 digit angka");
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("Format email tidak valid");
    }

    if (!no_wa || !no_wa.trim()) {
      errors.push("Nomor WhatsApp wajib diisi");
    } else {
      const normalizedPhone = normalizePhoneNumber(no_wa);
      if (!isValidIndonesianMobile(normalizedPhone)) {
        errors.push("Nomor WhatsApp tidak valid");
      }
    }

    if (!jenis_layanan || !jenis_layanan.trim()) {
      errors.push("Jenis layanan wajib dipilih");
    }

    if (!consent) {
      errors.push("Anda harus menyetujui pemberian notifikasi");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { message: "Validasi gagal", errors },
        { status: 400 }
      );
    }

    // Generate unique tracking code
    const trackingCode = generateTrackingCode();

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(no_wa);

    // Create submission
    const submission = await Submission.create({
      tracking_code: trackingCode,
      nama: nama.trim(),
      nik: nik.trim(),
      email: email ? email.trim() : null,
      no_wa: normalizedPhone,
      jenis_layanan: jenis_layanan.trim(),
      status: "PENGAJUAN_BARU",
    });

    return NextResponse.json(
      {
        message: "Pengajuan berhasil dibuat",
        tracking_code: trackingCode,
        submission_id: submission.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating submission:", error);

    // Handle unique constraint violation
    if (error.name === "SequelizeUniqueConstraintError") {
      return NextResponse.json(
        { message: "Kode tracking sudah ada, silakan coba lagi" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}

/**
 * Generate unique tracking code
 * Format: LP-YYYYMMDD-XXXXX (e.g., LP-20241201-12345)
 */
function generateTrackingCode() {
  const date = new Date();
  const dateStr =
    date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, "0") +
    date.getDate().toString().padStart(2, "0");

  const randomNum = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");

  return `LP-${dateStr}-${randomNum}`;
}
