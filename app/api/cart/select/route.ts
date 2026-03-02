import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
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

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { productId, selected } = body;

    const cart = await Cart.findOne({ userId: user._id });

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    if (selected) {
      if (!cart.selectedItems.includes(productId)) {
        cart.selectedItems.push(productId);
      }
    } else {
      cart.selectedItems = cart.selectedItems.filter(id => id !== productId);
    }

    await cart.save();

    return NextResponse.json({ message: "Selection updated", cart });
  } catch (error) {
    console.error("Error updating selection:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}