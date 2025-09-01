import { NextResponse } from "next/server";

// Very simple test route without any external dependencies
export async function GET() {
  return NextResponse.json({
    message: "Simple GET test working",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: process.env.VERCEL || "false",
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      message: "Simple POST test working",
      receivedData: body,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      vercel: process.env.VERCEL || "false",
    });
  } catch (error) {
    return NextResponse.json({
      message: "Simple POST test working but no body",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      vercel: process.env.VERCEL || "false",
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
