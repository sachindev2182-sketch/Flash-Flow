export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

async function verifyAnyToken(token: string) {
  try {
    return await adminAuth.verifyIdToken(token);
  } catch (err: any) {
    if (err?.message?.includes('incorrect "iss"') || err?.code === "auth/argument-error") {
      return await adminAuth.verifySessionCookie(token, true);
    }
    throw err;
  }
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get("cookie")
      ?.split("authToken=")[1]
      ?.split(";")[0];

    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    const decoded = await verifyAnyToken(token);

    await connectDB();
    const user = await User.findOne({ email: decoded.email });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("me route error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
