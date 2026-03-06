// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");

    const skip = (page - 1) * limit;

    let filter: any = {};
    if (category && category !== "all") {
      filter.category = category;
    }
    
    // Add subcategory filter if provided
    if (subcategory) {
      filter.subcategory = subcategory;
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); 

    const transformedProducts = products.map(product => ({
      ...product,
      id: product._id.toString(),
      // Map MongoDB fields to CategoryProduct interface
      isNew: product.isNewArrival || false,
      isTrending: product.isTrending || false,
    }));

    const total = await Product.countDocuments(filter);

    return NextResponse.json({
      products: transformedProducts,
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