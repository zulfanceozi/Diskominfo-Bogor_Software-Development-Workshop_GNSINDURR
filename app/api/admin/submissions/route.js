import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Mock data for testing - no database connection needed
    const mockSubmissions = [];
    
    return NextResponse.json(mockSubmissions);
  } catch (error) {
    console.error("Error in admin submissions API:", error);
    return NextResponse.json([]);
  }
}
