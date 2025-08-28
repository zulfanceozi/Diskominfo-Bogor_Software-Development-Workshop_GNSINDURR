import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { tracking_code } = params;
    const { searchParams } = new URL(request.url);
    const last4_nik = searchParams.get("last4_nik");

    // Basic validation
    if (!tracking_code || !last4_nik) {
      return NextResponse.json(
        { message: "Kode tracking dan 4 digit terakhir NIK wajib diisi" },
        { status: 400 }
      );
    }

    if (last4_nik.length !== 4 || !/^\d+$/.test(last4_nik)) {
      return NextResponse.json(
        { message: "4 digit terakhir NIK harus berupa angka" },
        { status: 400 }
      );
    }

    // Mock response - in real app this would query the database
    console.log("Mock: Checking status for tracking code:", tracking_code, "last4_nik:", last4_nik);

    // Return mock data
    const mockSubmission = {
      id: "mock-id-123",
      tracking_code: tracking_code,
      nama: "Mock User",
      jenis_layanan: "Pembuatan KTP",
      status: "PENGAJUAN_BARU",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(mockSubmission);
  } catch (error) {
    console.error("Error checking submission status:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
