import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import User from "@/models/User";

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

    // Check if user is admin
    const user = await User.findOne({ email: decoded.email });
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, price, category, subcategory, image, isNewArrival, isTrending } = body;

    // Validate required fields
    if (!title || !description || !price || !category || !subcategory || !image) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const validSubcategories: Record<string, string[]> = {
      men: ["Clothing", "Footwear", "Sports", "Accessories"],
      women: ["Clothing", "Footwear", "Accessories", "Jewelery", "Beauty"],
      kids: ["Boys", "Girls", "Footwear", "Toys"],
      home: ["Home decor", "Furnishing", "Kitchen", "Groceries", "Electronics", "Gadgets", "Books"],
      beauty: ["Makeup", "Skincare", "Haircare", "Fragrance"],
    };

    if (!validSubcategories[category]?.includes(subcategory)) {
      return NextResponse.json(
        { error: "Invalid subcategory for the selected category" },
        { status: 400 }
      );
    }

    const product = await Product.create({
      title,
      description,
      price,
      category,
      subcategory,
      image,
      isNewArrival: isNewArrival || false,
      isTrending: isTrending || false,
      createdBy: user._id,
    });

    return NextResponse.json(
      { message: "Product created successfully", product },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const user = await User.findOne({ email: decoded.email });
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query parameters for pagination
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    let filter: any = {};
    
    if (category && category !== "all") {
      filter.category = category;
    }
    
    if (subcategory && subcategory !== "all") {
      filter.subcategory = subcategory;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Get products with pagination
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email");

    const total = await Product.countDocuments(filter);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}