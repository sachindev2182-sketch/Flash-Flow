export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 400 });
    }

    /*
     =====================================================
     1️⃣ ALWAYS verify as ID token (NOT session cookie)
     This works for:
     - OTP
     - Google
     - Github
     - Custom token signIn
     =====================================================
    */

    const decoded = await adminAuth.verifyIdToken(token, true);
console.log("DECODED TOKEN:", decoded);

    /*
     =====================================================
     2️⃣ Ensure Firebase user exists (safe for all flows)
     =====================================================
    */

    try {
      await adminAuth.getUser(decoded.uid);
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        await adminAuth.createUser({
          uid: decoded.uid,
          email: decoded.email,
          emailVerified: true,
        });
      } else {
        throw error;
      }
    }

    /*
     =====================================================
     3️⃣ Connect MongoDB
     =====================================================
    */

    await connectDB();

    /*
     =====================================================
     4️⃣ Sync Mongo User
     =====================================================
    */

    /*
 =====================================================
 4️⃣ Sync Mongo User + update lastActive (PRODUCTION)
 =====================================================
*/

const user = await User.findOneAndUpdate(
  { email: decoded.email },
  {
    $setOnInsert: {
      name: decoded.name || decoded.email?.split("@")[0] || "User",
      email: decoded.email,
      role: "user",
    },
    $set: {
      lastActive: new Date(),
      isVerified: true,
    },
  },
  { upsert: true, new: true }
);

    /*
     =====================================================
     5️⃣ Create Session Cookie (14 days)
     =====================================================
    */

    const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 days

    const sessionCookie = await adminAuth.createSessionCookie(token, {
      expiresIn,
    });

    const response = NextResponse.json({
      success: true,
      role: user.role,
    });

    response.cookies.set("authToken", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: expiresIn / 1000,
    });

    return response;
  } catch (error) {
    console.error("firebase-login error:", error);

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
