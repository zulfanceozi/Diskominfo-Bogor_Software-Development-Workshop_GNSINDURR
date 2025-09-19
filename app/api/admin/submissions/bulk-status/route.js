import { NextResponse } from "next/server";
import { Submission, initializeDatabase } from "../../../../../lib/sequelize";

// Initialize database on first request
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
};

export async function PATCH(request) {
  try {
    await initDB();

    // In a real application, you would verify admin authentication here
    // For workshop purposes, we'll skip authentication

    const body = await request.json();
    const { submissionIds, status } = body;

    // Validate input
    if (!submissionIds || !Array.isArray(submissionIds) || submissionIds.length === 0) {
      return NextResponse.json(
        { message: "submissionIds harus berupa array yang tidak kosong" },
        { status: 400 }
      );
    }

    if (!status || !["PENGAJUAN_BARU", "DIPROSES", "SELESAI", "DITOLAK"].includes(status)) {
      return NextResponse.json(
        { message: "Status tidak valid" },
        { status: 400 }
      );
    }

    // Update multiple submissions
    const [updatedCount] = await Submission.update(
      { 
        status: status,
        updated_at: new Date()
      },
      {
        where: {
          id: submissionIds
        }
      }
    );

    console.log(
      `[${new Date().toISOString()}] Bulk update: ${updatedCount} submissions updated to status ${status}`
    );

    // Return success response
    const response = NextResponse.json({
      success: true,
      message: `${updatedCount} pengajuan berhasil diupdate`,
      updatedCount: updatedCount,
      status: status
    });

    // Set cache control headers
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate, private"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    console.error("Error in bulk status update:", error);

    const errorResponse = NextResponse.json(
      { message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );

    // Set cache control headers for errors too
    errorResponse.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate, private"
    );
    errorResponse.headers.set("Pragma", "no-cache");
    errorResponse.headers.set("Expires", "0");

    return errorResponse;
  }
}
