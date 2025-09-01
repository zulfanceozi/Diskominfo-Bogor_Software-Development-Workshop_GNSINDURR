import { NextResponse } from "next/server";
import { Submission, initializeDatabase } from "@/lib/sequelize";

export async function GET() {
  try {
    await initializeDatabase();
    
    console.log("🧪 Test endpoint called");
    
    // Test 1: Simple count
    const count = await Submission.count();
    console.log("📊 Total submissions count:", count);
    
    // Test 2: Get all submissions
    const submissions = await Submission.findAll({
      order: [["created_at", "DESC"]],
      limit: 5
    });
    
    console.log("📋 Found submissions:", submissions.length);
    
    // Test 3: Raw SQL
    const { sequelize } = await import("@/lib/sequelize");
    const rawResult = await sequelize.query(`
      SELECT COUNT(*) as count FROM submissions
    `);
    
    console.log("🔍 Raw SQL count:", rawResult[0][0].count);
    
    return NextResponse.json({
      success: true,
      database_count: count,
      sequelize_submissions: submissions.length,
      raw_sql_count: rawResult[0][0].count,
      submissions: submissions.map(s => ({
        id: s.id,
        tracking_code: s.tracking_code,
        nama: s.nama,
        status: s.status,
        created_at: s.created_at
      }))
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error("❌ Test endpoint error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
