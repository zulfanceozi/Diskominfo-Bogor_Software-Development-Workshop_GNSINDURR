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

// Single handler function for all methods
export default async function handler(request, { params }) {
  const method = request.method;
  
  console.log(`🔍 ${method} request received for status update`);
  
  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
  
  // Handle PATCH - Update submission status
  if (method === 'PATCH') {
    try {
      await initDB();

      const { id } = params;
      const body = await request.json();
      const { status } = body;

      console.log("Updating submission:", id, "to status:", status);

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

      console.log("Status updated successfully:", oldStatus, "->", status);

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
      console.log('📧 Checking email notification for submission:', submission.id);
      console.log('📧 Submission email:', submission.email);
      
      if (submission.email) {
        console.log('📧 Sending email notification to:', submission.email);
        const emailResult = await sendStatusUpdateEmail(submission, status);
        console.log('📧 Email result:', emailResult);
        
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
      } else {
        console.log('📧 No email address found for submission:', submission.id);
      }

      // Wait for all notification logs to be created
      await Promise.all(notificationPromises);

      console.log("All notifications processed successfully");

      return NextResponse.json({
        message: "Status berhasil diupdate",
        old_status: oldStatus,
        new_status: status,
        submission_id: submission.id,
      });
    } catch (error) {
      console.error("Error updating submission status:", error);

      return NextResponse.json(
        { 
          message: "Terjadi kesalahan internal server",
          error: error.message 
        },
        { status: 500 }
      );
    }
  }
  
  // Handle other methods (GET, POST, PUT, DELETE)
  return NextResponse.json(
    { 
      message: `Method ${method} not allowed. Use PATCH to update status.`,
      allowed_methods: ['PATCH', 'OPTIONS']
    },
    { status: 405 }
  );
}
