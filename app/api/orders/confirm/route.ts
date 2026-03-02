import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import Cart from "@/models/Cart";
import User from "@/models/User";
import { stripe } from "@/lib/stripe";

// Helper function to generate payment ID
const generatePaymentId = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `PAY${year}${month}${day}${random}`;
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
    const { orderId, paymentIntentId, paymentMethod } = body;

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify order belongs to user
    if (order.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (paymentMethod === "cod") {
      // For COD, just confirm the order
      order.orderStatus = "confirmed";
      order.paymentStatus = "pending";
      await order.save();

      // Clear user's cart
      await Cart.findOneAndDelete({ userId: user._id });
    } else {
      // For card payments, verify payment intent
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === "succeeded") {
        order.orderStatus = "confirmed";
        order.paymentStatus = "completed";
        order.stripePaymentIntentId = paymentIntentId;
        await order.save();

        // Create payment record with explicit paymentId
        const paymentId = generatePaymentId();
        await Payment.create({
          paymentId, // Explicitly set paymentId
          orderId: order._id,
          userId: user._id,
          amount: order.totalAmount,
          currency: "inr",
          paymentMethod,
          status: "succeeded",
          stripePaymentIntentId: paymentIntentId,
        });

        // Clear user's cart
        await Cart.findOneAndDelete({ userId: user._id });
      } else {
        return NextResponse.json(
          { error: "Payment not successful" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error confirming order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}