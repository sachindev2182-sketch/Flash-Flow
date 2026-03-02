import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import Wishlist from "@/models/Wishlist";
import User from "@/models/User";

// GET /api/wishlist 
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

    // Check if user exists
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get or create wishlist for user
    let wishlist = await Wishlist.findOne({ userId: user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId: user.id,
        items: [],
      });
    }

    return NextResponse.json({
      wishlist: {
        items: wishlist.items,
        totalItems: wishlist.totalItems,
        totalValue: wishlist.totalValue,
      },
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/wishlist - Add item to wishlist
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

    // Check if user exists
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { productId, title, description, price, image, category } = body;

    // Validate required fields
    if (!productId || !title || !description || !price || !image || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ userId: user.id });

    if (!wishlist) {
      wishlist = new Wishlist({
        userId: user.id,
        items: [],
      });
    }

    // Check if product already exists in wishlist
    const existingItem = wishlist.items.find(
      (item: any) => item.productId === productId
    );

    if (existingItem) {
      return NextResponse.json(
        { error: "Product already in wishlist" },
        { status: 400 }
      );
    }

    // Add new item
    wishlist.items.push({
      productId,
      title,
      description,
      price,
      image,
      category,
      addedAt: new Date(),
    });

    await wishlist.save();

    return NextResponse.json(
      {
        message: "Item added to wishlist successfully",
        wishlist: {
          items: wishlist.items,
          totalItems: wishlist.totalItems,
          totalValue: wishlist.totalValue,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/wishlist - Clear entire wishlist
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

    // Check if user exists
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const wishlist = await Wishlist.findOne({ userId: user.id });

    if (!wishlist) {
      return NextResponse.json(
        { error: "Wishlist not found" },
        { status: 404 }
      );
    }

    // Clear all items
    wishlist.items = [];
    await wishlist.save();

    return NextResponse.json({
      message: "Wishlist cleared successfully",
      wishlist: {
        items: [],
        totalItems: 0,
        totalValue: 0,
      },
    });
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}