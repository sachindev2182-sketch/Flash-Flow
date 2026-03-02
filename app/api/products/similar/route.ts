import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const currentProductId = searchParams.get("currentProductId");
    const limit = parseInt(searchParams.get("limit") || "5");

    if (!category) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    let filter: any = {
      category: category.toLowerCase(),
    };

    if (currentProductId && mongoose.Types.ObjectId.isValid(currentProductId)) {
      filter._id = { $ne: currentProductId };
    }

    const allProducts = await Product.find(filter).lean();

    const shuffled = allProducts.sort(() => 0.5 - Math.random());
    const selectedProducts = shuffled.slice(0, Math.min(limit, allProducts.length));

    const transformedProducts = selectedProducts.map(product => ({
      _id: product._id.toString(),
      title: product.title,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
    }));

    return NextResponse.json({ products: transformedProducts });
  } catch (error) {
    console.error("Error fetching similar products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}