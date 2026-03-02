import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // Check if user is admin
    const adminUser = await User.findOne({ email: decoded.email });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid cart ID format" },
        { status: 400 }
      );
    }

    // Get cart
    const cart = await Cart.findById(id).lean();

    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
    }

    // Get user details
    const user = await User.findById(cart.userId).select('name email').lean();

    // Transform cart data
    const transformedCart = {
      _id: cart._id.toString(),
      userId: cart.userId.toString(),
      userName: user?.name || 'Unknown User',
      userEmail: user?.email || 'Unknown Email',
      items: cart.items.map((item: any) => ({
        productId: item.productId.toString(),
        productTitle: item.title,
        productImage: item.image,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.price * item.quantity,
        size: item.size,
        category: item.category,
        addedAt: item.addedAt,
      })),
      totalItems: cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
      totalValue: cart.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };

    return NextResponse.json({ cart: transformedCart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}