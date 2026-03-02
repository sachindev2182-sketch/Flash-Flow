import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import Wishlist from "@/models/Wishlist";
import User from "@/models/User";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
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
    const { productId } = await params;

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const item = cart.items.find(item => item.productId.toString() === productId);
    if (!item) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });
    }

    // Remove from cart
    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    cart.selectedItems = cart.selectedItems.filter(id => id !== productId);
    await cart.save();

    // Add to wishlist
    let wishlist = await Wishlist.findOne({ userId: user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: user._id, items: [] });
    }

    const wishlistItem = {
      productId: item.productId.toString(),
      title: item.title,
      description: item.description,
      price: item.price,
      image: item.image,
      category: item.category.charAt(0).toUpperCase() + item.category.slice(1),
      addedAt: new Date(),
    };

    // Check if already in wishlist
    const existingInWishlist = wishlist.items.some(
      (i: any) => i.productId === productId
    );

    if (!existingInWishlist) {
      wishlist.items.push(wishlistItem);
      await wishlist.save();
    }

    return NextResponse.json({ message: "Moved to wishlist successfully" });
  } catch (error) {
    console.error("Error moving to wishlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}