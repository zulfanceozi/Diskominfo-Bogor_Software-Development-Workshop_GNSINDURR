import { NextResponse } from "next/server";
import { Admin } from "../../../../lib/sequelize";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = await Admin.count();
    return NextResponse.json({ ok: true, admins: count });
  } catch (error) {
    console.error("Admin login healthcheck error:", error);
    return NextResponse.json(
      { ok: false, error: String(error?.message || error) },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Find admin by username
    const admin = await Admin.findOne({
      where: {
        email: email,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Return success response (in production, you would generate a JWT token here)
    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
