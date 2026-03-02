import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";
import User from "@/models/User";
import mongoose from "mongoose";

export async function DELETE(req: NextRequest) {
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

    const body = await req.json();
    const { reviewIds } = body;

    if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
      return NextResponse.json(
        { error: "Review IDs are required" },
        { status: 400 }
      );
    }

    // Validate all IDs
    const validIds = reviewIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    if (validIds.length === 0) {
      return NextResponse.json(
        { error: "No valid review IDs provided" },
        { status: 400 }
      );
    }

    // Delete reviews
    const result = await Review.deleteMany({
      _id: { $in: validIds }
    });

    return NextResponse.json({
      message: `Successfully deleted ${result.deletedCount} reviews`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error bulk deleting reviews:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}