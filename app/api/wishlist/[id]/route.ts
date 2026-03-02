import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import Wishlist from "@/models/Wishlist";
import User from "@/models/User";

// DELETE /api/wishlist/[id] - Remove specific item from wishlist
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // Find and remove the item
    const itemIndex = wishlist.items.findIndex(
      (item: any) => item.productId === id
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: "Item not found in wishlist" },
        { status: 404 }
      );
    }

    // Remove the item
    wishlist.items.splice(itemIndex, 1);
    await wishlist.save();

    return NextResponse.json({
      message: "Item removed from wishlist successfully",
      wishlist: {
        items: wishlist.items,
        totalItems: wishlist.totalItems,
        totalValue: wishlist.totalValue,
      },
    });
  } catch (error) {
    console.error("Error removing item from wishlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/wishlist/[id] - Update item in wishlist (if needed)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // Check if user exists
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title, description, price, image, category } = body;

    const wishlist = await Wishlist.findOne({ userId: user.id });

    if (!wishlist) {
      return NextResponse.json(
        { error: "Wishlist not found" },
        { status: 404 }
      );
    }

    // Find the item
    const item = wishlist.items.find((item: any) => item.productId === id);

    if (!item) {
      return NextResponse.json(
        { error: "Item not found in wishlist" },
        { status: 404 }
      );
    }

    // Update item fields if provided
    if (title) item.title = title;
    if (description) item.description = description;
    if (price) item.price = price;
    if (image) item.image = image;
    if (category) item.category = category;

    await wishlist.save();

    return NextResponse.json({
      message: "Item updated successfully",
      wishlist: {
        items: wishlist.items,
        totalItems: wishlist.totalItems,
        totalValue: wishlist.totalValue,
      },
    });
  } catch (error) {
    console.error("Error updating wishlist item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}