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

    // Check if user is admin
    const adminUser = await User.findOne({ email: decoded.email });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all addresses
    const addresses = await Address.find({}).lean();

    // Calculate statistics
    const totalAddresses = addresses.length;
    
    // Get unique users with addresses
    const uniqueUserIds = new Set(addresses.map(a => a.userId.toString()));
    const totalUsersWithAddresses = uniqueUserIds.size;

    // Count by address type
    const homeAddresses = addresses.filter(a => a.addressType === "home").length;
    const workAddresses = addresses.filter(a => a.addressType === "work").length;
    const otherAddresses = addresses.filter(a => a.addressType === "other").length;

    // Count default addresses
    const defaultAddresses = addresses.filter(a => a.isDefault).length;

    return NextResponse.json({
      stats: {
        totalAddresses,
        totalUsersWithAddresses,
        homeAddresses,
        workAddresses,
        otherAddresses,
        defaultAddresses,
      },
    });
  } catch (error) {
    console.error("Error fetching address stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}