export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Otp from "@/models/Otp";
import User from "@/models/User";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, otp, idToken, name } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 },
      );
    }

    const storedOtp = await Otp.findOne({ email });

    if (!storedOtp) {
      return NextResponse.json({ error: "No OTP found" }, { status: 400 });
    }

    if (storedOtp.expires < new Date()) {
      await Otp.deleteMany({ email });
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    if (storedOtp.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    let user;

    if (storedOtp.type === "signup") {
      user = await User.findOneAndUpdate(
        { email },
        {
          $setOnInsert: {
            name: name || email.split("@")[0],
            email,
            role: "user",
          },
          $set: {
            isVerified: true,
            lastActive: new Date(),
          },
        },
        { upsert: true, new: true },
      );
    } else {
      user = await User.findOneAndUpdate(
        { email },
        {
          $set: {
            lastActive: new Date(),
          },
        },
        { new: true },
      );

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    await Otp.deleteMany({ email });
    await adminDb.collection("users").doc(user._id.toString()).set(
      {
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        updatedAt: new Date(),
      },
      { merge: true },
    );
    // Create Firebase custom token
    const customToken = await adminAuth.createCustomToken(user._id.toString(), {
      email: user.email,
    });

    return NextResponse.json({
      success: true,
      customToken,
    });
  } catch (error) {
    console.error("VERIFY ERROR:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
