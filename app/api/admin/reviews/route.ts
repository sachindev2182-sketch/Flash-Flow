import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
import User from "@/models/User";
import mongoose from "mongoose";

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

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const filterBy = searchParams.get("filterBy") || "all";
    const filterValue = searchParams.get("filterValue") || "";
    const sortBy = searchParams.get("sortBy") || "newest";

    const skip = (page - 1) * limit;

    // Build filter
    let filter: any = {};

    if (filterBy === "product" && filterValue) {
      if (mongoose.Types.ObjectId.isValid(filterValue)) {
        filter.productId = new mongoose.Types.ObjectId(filterValue);
      }
    } else if (filterBy === "user" && filterValue) {
      if (mongoose.Types.ObjectId.isValid(filterValue)) {
        filter.userId = new mongoose.Types.ObjectId(filterValue);
      }
    }

    // Search in comment
    if (search) {
      filter.comment = { $regex: search, $options: "i" };
    }

    // Build sort
    let sort: any = {};
    switch (sortBy) {
      case "newest":
        sort = { createdAt: -1 };
        break;
      case "oldest":
        sort = { createdAt: 1 };
        break;
      case "highest":
        sort = { rating: -1, createdAt: -1 };
        break;
      case "lowest":
        sort = { rating: 1, createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Get reviews with pagination
    const reviews = await Review.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get product and user details for each review
    const productIds = [...new Set(reviews.map(r => r.productId.toString()))];
    const userIds = [...new Set(reviews.map(r => r.userId.toString()))];

    const products = await Product.find({ _id: { $in: productIds } })
      .select('title image')
      .lean();

    const users = await User.find({ _id: { $in: userIds } })
      .select('name email')
      .lean();

    const productMap = new Map(products.map(p => [p._id.toString(), p]));
    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    // Transform reviews with additional data
    const transformedReviews = reviews.map(review => ({
      _id: review._id.toString(),
      productId: review.productId.toString(),
      productTitle: productMap.get(review.productId.toString())?.title || 'Unknown Product',
      productImage: productMap.get(review.productId.toString())?.image || '/placeholder.jpg',
      userId: review.userId.toString(),
      userName: userMap.get(review.userId.toString())?.name || 'Unknown User',
      userEmail: userMap.get(review.userId.toString())?.email || 'Unknown Email',
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    }));

    const total = await Review.countDocuments(filter);

    return NextResponse.json({
      reviews: transformedReviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}