export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

async function verifyAnyTokenFromCookie(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const token = cookie.split("authToken=")[1]?.split(";")[0];

  if (!token) throw new Error("No token");

  try {
    return await adminAuth.verifyIdToken(token);
  } catch (err: any) {
    if (
      err?.message?.includes('incorrect "iss"') ||
      err?.code === "auth/argument-error"
    ) {
      return await adminAuth.verifySessionCookie(token, true);
    }
    throw err;
  }
}

export async function GET(req: Request) {
  try {
    const decoded = await verifyAnyTokenFromCookie(req);

    await connectDB();

    const current = await User.findOne({ email: decoded.email });

    if (!current || current.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await User.find({
      email: { $ne: decoded.email },
    })
      .sort({ createdAt: -1 })
      .lean();

    const payload = users.map((u: any) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      isVerified: u.isVerified,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ users: payload });
  } catch (err: any) {
    console.error("GET /api/admin/users error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
