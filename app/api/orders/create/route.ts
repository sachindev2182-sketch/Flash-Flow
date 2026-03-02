import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import User from "@/models/User";
import { stripe } from "@/lib/stripe";

// Helper function to generate order ID
const generateOrderId = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `ORD${year}${month}${day}${random}`;
};

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
    const { shippingAddress, paymentMethod, items, subtotal, deliveryCharge, totalAmount } = body;

    // Validate required fields
    if (!shippingAddress || !paymentMethod || !items || !subtotal || !totalAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate order ID
    const orderId = generateOrderId();

    // Create order with explicit orderId
    const order = await Order.create({
      orderId, // Explicitly set orderId
      userId: user._id,
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      deliveryCharge,
      totalAmount,
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      orderStatus: "pending",
    });

    // If payment method is not COD, create Stripe Payment Intent
    let paymentIntent = null;
    if (paymentMethod !== "cod") {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Convert to paise
        currency: "inr",
        metadata: {
          orderId: order._id.toString(),
          userId: user._id.toString(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      order,
      clientSecret: paymentIntent?.client_secret,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}