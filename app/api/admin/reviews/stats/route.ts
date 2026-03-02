import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
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

    // Get all reviews
    const reviews = await Review.find({}).lean();

    // Calculate statistics
    const totalReviews = reviews.length;
    
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    // Get unique products with reviews
    const uniqueProductIds = new Set(reviews.map(r => r.productId.toString()));
    const totalProductsWithReviews = uniqueProductIds.size;

    // Rating distribution
    const ratingDistribution = {
      1: reviews.filter(r => r.rating === 1).length,
      2: reviews.filter(r => r.rating === 2).length,
      3: reviews.filter(r => r.rating === 3).length,
      4: reviews.filter(r => r.rating === 4).length,
      5: reviews.filter(r => r.rating === 5).length,
    };

    return NextResponse.json({
      stats: {
        totalReviews,
        averageRating,
        totalProductsWithReviews,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Error fetching review stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}