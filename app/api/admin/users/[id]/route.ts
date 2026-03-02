export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
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

/* ================= PUT ================= */

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = await verifyAnyTokenFromCookie(req);
    await connectDB();

    const current = await User.findOne({ email: decoded.email });

    if (!current || current.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params; // ✅ FIXED
    const { name, role, isVerified } = await req.json();

    const updates: any = {};
    if (typeof name === "string") updates.name = name;
    if (typeof role === "string") updates.role = role;
    if (typeof isVerified === "boolean") updates.isVerified = isVerified;

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    try {
      await adminDb.collection("users").doc(id).set(
        {
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          isVerified: updatedUser.isVerified,
          updatedAt: new Date(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Firestore update failed:", err);
    }

    try {
      await adminAuth.setCustomUserClaims(id, {
        role: updatedUser.role,
      });
    } catch (err) {
      console.error("setCustomUserClaims failed:", err);
    }

    return NextResponse.json({
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (err: any) {
    console.error("PUT error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

/* ================= DELETE ================= */

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = await verifyAnyTokenFromCookie(req);
    await connectDB();

    const current = await User.findOne({ email: decoded.email });

    if (!current || current.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params; // ✅ FIXED

    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    try {
      await adminDb.collection("users").doc(id).delete();
    } catch (err) {
      console.error("Firestore delete failed:", err);
    }

    try {
      await adminAuth.deleteUser(id);
    } catch (err) {
      console.error("Firebase deleteUser failed:", err);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
