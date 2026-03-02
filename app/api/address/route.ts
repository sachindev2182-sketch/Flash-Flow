import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import Address from "@/models/Address";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const token = (await cookies()).get("authToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = await adminAuth.verifySessionCookie(token, true);
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const addresses = await Address.find({ userId: user._id })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get("authToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = await adminAuth.verifySessionCookie(token, true);
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      fullName,
      phoneNumber,
      houseNumber,
      street,
      city,
      state,
      pincode,
      isDefault,
      addressType,
    } = body;

    if (
      !fullName ||
      !phoneNumber ||
      !houseNumber ||
      !street ||
      !city ||
      !state ||
      !pincode
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit phone number" },
        { status: 400 },
      );
    }

    if (!/^[0-9]{6}$/.test(pincode)) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit pincode" },
        { status: 400 },
      );
    }

    if (isDefault) {
      await Address.updateMany(
        { userId: user._id },
        { $set: { isDefault: false } },
      );
    }

    const address = await Address.create({
      userId: user._id,
      fullName,
      phoneNumber,
      houseNumber,
      street,
      city,
      state,
      pincode,
      isDefault: isDefault || false,
      addressType: addressType || "home",
    });

    return NextResponse.json(
      { message: "Address added successfully", address },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error adding address:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
