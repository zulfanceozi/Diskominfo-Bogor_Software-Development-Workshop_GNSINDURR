import { NextResponse } from "next/server";
import { Submission, NotificationLog, initializeDatabase } from "@/lib/sequelize";
import { sendStatusUpdateNotification } from "@/lib/notify/twilio";
import { sendStatusUpdateEmail } from "@/lib/notify/email";

// Initialize database on first request
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
};

export async function PATCH(request, { params }) {
  try {
    await initDB();

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    // Validation
    if (
      !status ||
      !["PENGAJUAN_BARU", "DIPROSES", "SELESAI", "DITOLAK"].includes(status)
    ) {
      return NextResponse.json(
        { message: "Status tidak valid" },
        { status: 400 }
      );
    }

    // Find submission
    const submission = await Submission.findByPk(id);
    if (!submission) {
      return NextResponse.json(
        { message: "Pengajuan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if status is actually changing
    if (submission.status === status) {
      return NextResponse.json(
        { message: "Status sudah sama" },
        { status: 400 }
      );
    }

    // Update status
    const oldStatus = submission.status;
    await submission.update({ status });

    // Send notifications
    const notificationPromises = [];

    // Send WhatsApp notification
    const waResult = await sendStatusUpdateNotification(submission, status);
    notificationPromises.push(
      NotificationLog.create({
        submission_id: submission.id,
        channel: "WHATSAPP",
        send_status: waResult.success ? "SUCCESS" : "FAILED",
        payload: {
          to: submission.no_wa,
          status: status,
          result: waResult,
        },
      })
    );

    // Send email notification if email exists
    if (submission.email) {
      const emailResult = await sendStatusUpdateEmail(submission, status);
      notificationPromises.push(
        NotificationLog.create({
          submission_id: submission.id,
          channel: "EMAIL",
          send_status: emailResult.success ? "SUCCESS" : "FAILED",
          payload: {
            to: submission.email,
            status: status,
            result: emailResult,
          },
        })
      );
    }

    // Wait for all notification logs to be created
    await Promise.all(notificationPromises);

    return NextResponse.json({
      message: "Status berhasil diupdate",
      old_status: oldStatus,
      new_status: status,
      submission_id: submission.id,
    });
  } catch (error) {
    console.error("Error updating submission status:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
