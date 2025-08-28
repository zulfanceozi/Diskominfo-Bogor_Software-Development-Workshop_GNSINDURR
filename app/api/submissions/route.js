import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { nama, nik, email, no_wa, jenis_layanan } = body;

    // Basic validation
    if (!nama || !nik || !no_wa || !jenis_layanan) {
      return NextResponse.json(
        { message: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    if (nik.length !== 16) {
      return NextResponse.json(
        { message: "NIK harus 16 digit" },
        { status: 400 }
      );
    }

    // Generate mock tracking code
    const tracking_code = `TRK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Mock response - in real app this would save to database
    console.log("Mock: Creating submission:", { nama, nik, email, no_wa, jenis_layanan, tracking_code });

    return NextResponse.json({
      success: true,
      tracking_code: tracking_code,
      message: "Pengajuan berhasil dibuat (mock)"
    });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
