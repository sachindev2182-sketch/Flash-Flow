import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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

    const product = await Product.findById(id).populate(
      "createdBy",
      "name email",
    );

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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
    const {
      title,
      description,
      price,
      category,
      subcategory,
      image,
      isNewArrival,
      isTrending,
    } = body;

    console.log(" Updating product with data:", {
      title,
      description,
      price,
      category,
      subcategory,
    });

    if (
      !title ||
      !description ||
      !price ||
      !category ||
      !subcategory ||
      !image
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const validSubcategories: Record<string, string[]> = {
      men: ["Clothing", "Footwear", "Sports", "Accessories"],
      women: ["Clothing", "Footwear", "Accessories", "Jewelery", "Beauty"],
      kids: ["Boys", "Girls", "Footwear", "Toys"],
      home: [
        "Home decor",
        "Furnishing",
        "Kitchen",
        "Groceries",
        "Electronics",
        "Gadgets",
        "Books",
      ],
      beauty: ["Makeup", "Skincare", "Haircare", "Fragrance"],
    };

    if (!validSubcategories[category]?.includes(subcategory)) {
      return NextResponse.json(
        {
          error: `"${subcategory}" is not a valid subcategory for ${category}`,
        },
        { status: 400 },
      );
    }

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await Product.updateOne(
      { _id: id },
      {
        title,
        description,
        price,
        category,
        subcategory,
        image,
        isNewArrival,
        isTrending,
        updatedAt: new Date(),
      },
    );

    const updatedProduct = await Product.findById(id).populate(
      "createdBy",
      "name email",
    );

    return NextResponse.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error: any) {
    console.error(" Error updating product:", error);

    if (error.message?.includes("not a valid subcategory")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.name === "CastError") {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 },
      );
    }

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
    const { id } = await params;
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
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
