import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import Address from "@/models/Address";
import User from "@/models/User";
import mongoose from "mongoose";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid address ID format" },
        { status: 400 },
      );
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const address = await Address.findOne({ _id: id, userId: user._id });
    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
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

    if (phoneNumber && !/^[0-9]{10}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit phone number" },
        { status: 400 },
      );
    }

    if (pincode && !/^[0-9]{6}$/.test(pincode)) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit pincode" },
        { status: 400 },
      );
    }

    if (isDefault === true) {
      await Address.updateMany(
        { userId: user._id, _id: { $ne: id } },
        { $set: { isDefault: false } },
      );
    }

    // Update fields
    if (fullName) address.fullName = fullName;
    if (phoneNumber) address.phoneNumber = phoneNumber;
    if (houseNumber) address.houseNumber = houseNumber;
    if (street) address.street = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (pincode) address.pincode = pincode;
    if (addressType) address.addressType = addressType;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await address.save();

    return NextResponse.json({
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid address ID format" },
        { status: 400 },
      );
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const address = await Address.findOneAndDelete({
      _id: id,
      userId: user._id,
    });

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
