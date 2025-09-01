import { NextResponse } from "next/server";

// Simple test route to verify App Router is working
export async function GET() {
  return NextResponse.json({
    message: "GET method working",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      message: "POST method working",
      receivedData: body,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      message: "POST method working but no body",
      timestamp: new Date().toISOString(),
    });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      message: "PATCH method working",
      receivedData: body,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      message: "PATCH method working but no body",
      timestamp: new Date().toISOString(),
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
