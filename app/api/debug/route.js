import { NextResponse } from "next/server";

// Debug route to help troubleshoot Vercel deployment issues
export async function GET() {
  return NextResponse.json({
    message: "Debug route working",
    environment: process.env.NODE_ENV,
    vercel: process.env.VERCEL,
    timestamp: new Date().toISOString(),
    headers: {
      "user-agent": "Debug Route",
    },
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      message: "POST debug route working",
      receivedData: body,
      environment: process.env.NODE_ENV,
      vercel: process.env.VERCEL,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      message: "POST debug route working but no body",
      error: error.message,
      environment: process.env.NODE_ENV,
      vercel: process.env.VERCEL,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      message: "PATCH debug route working",
      receivedData: body,
      environment: process.env.NODE_ENV,
      vercel: process.env.VERCEL,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      message: "PATCH debug route working but no body",
      error: error.message,
      environment: process.env.NODE_ENV,
      vercel: process.env.VERCEL,
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
