import { NextResponse } from "next/server";
import { Submission, initializeDatabase } from "../../../../lib/sequelize";
import { Op } from "sequelize";

// Initialize database on first request
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
};

export async function GET(request) {
  try {
    await initDB();

    // In a real application, you would verify admin authentication here
    // For workshop purposes, we'll skip authentication

    // Parse cache-busting query parameters & filters
    const url = new URL(request.url);
    const queryTimestamp = url.searchParams.get("t");
    const queryRandom = url.searchParams.get("r");
    const queryForce = url.searchParams.get("force");
    const queryCacheBuster = url.searchParams.get("cb");
    const search = url.searchParams.get("search");
    const sortBy = url.searchParams.get("sortBy") || "created_at";
    const sortOrder = url.searchParams.get("sortOrder") || "DESC";

    // Force fresh data dengan multiple strategies
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const forceRefresh = Date.now();

    console.log(
      `[${new Date().toISOString()}] Fetching submissions with force refresh: ${timestamp}-${random}-${forceRefresh}`
    );
    console.log(
      `[${new Date().toISOString()}] Query params: t=${queryTimestamp}, r=${queryRandom}, force=${queryForce}, cb=${queryCacheBuster}`
    );
    console.log(
      `[${new Date().toISOString()}] Search params: search=${search}, sortBy=${sortBy}, sortOrder=${sortOrder}`
    );

    // Build where clause for search
    const where = {};
    
    // Add search functionality
    if (search) {
      where[Op.or] = [
        { nama: { [Op.iLike]: `%${search}%` } },
        { tracking_code: { [Op.iLike]: `%${search}%` } },
        { jenis_layanan: { [Op.iLike]: `%${search}%` } },
        { nik: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const submissions = await Submission.findAll({
      order: [[sortBy, sortOrder.toUpperCase()]],
      where,
      attributes: [
        "id",
        "tracking_code",
        "nama",
        "nik",
        "jenis_layanan",
        "status",
        "created_at",
        "updated_at",
      ],
      // Force fresh data
      raw: false,
      // Add random parameter to force fresh query
      logging: console.log,
    });

    console.log(
      `[${new Date().toISOString()}] Found ${submissions.length} submissions`
    );
    if (submissions.length > 0) {
      console.log(
        `[${new Date().toISOString()}] Latest submission: ${
          submissions[0].tracking_code
        } (${submissions[0].status})`
      );
    }

    // Vercel-specific no-cache headers
    const response = NextResponse.json(submissions);

    // Ultra-aggressive cache control
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate, private, max-age=0, s-maxage=0, stale-while-revalidate=0"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Clear-Site-Data", '"cache"');

    // Vercel-specific headers
    response.headers.set("Surrogate-Control", "no-store");
    response.headers.set("CDN-Cache-Control", "no-cache");
    response.headers.set("Vercel-CDN-Cache-Control", "no-cache");
    response.headers.set("X-Vercel-Cache", "MISS");

    // Force fresh response dengan dynamic values dan query params
    response.headers.set("Last-Modified", new Date().toUTCString());
    response.headers.set(
      "ETag",
      `"${timestamp}-${random}-${forceRefresh}-${queryTimestamp}-${queryRandom}"`
    );
    response.headers.set("X-Response-Time", `${Date.now()}`);
    response.headers.set(
      "X-Cache-Buster",
      `${timestamp}-${random}-${queryCacheBuster}`
    );
    response.headers.set("X-Force-Refresh", "true");
    response.headers.set(
      "X-Query-Params",
      `${queryTimestamp}-${queryRandom}-${queryForce}`
    );

    return response;
  } catch (error) {
    console.error("Error fetching submissions:", error);

    const errorResponse = NextResponse.json(
      { message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );

    // Same headers for errors
    errorResponse.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate, private"
    );
    errorResponse.headers.set("Pragma", "no-cache");
    errorResponse.headers.set("Expires", "0");
    errorResponse.headers.set("Surrogate-Control", "no-store");
    errorResponse.headers.set("CDN-Cache-Control", "no-cache");

    return errorResponse;
  }
}
