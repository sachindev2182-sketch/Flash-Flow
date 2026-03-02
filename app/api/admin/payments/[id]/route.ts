import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
import Order from "@/models/Order";
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
        { error: "Invalid payment ID format" },
        { status: 400 }
      );
    }

    const payment = await Payment.findById(id).lean();

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Get order details
    const order = await Order.findById(payment.orderId).select('orderId').lean();
    
    // Get user details
    const user = await User.findById(payment.userId).select('name email').lean();

    const transformedPayment = {
      _id: payment._id.toString(),
      paymentId: payment.paymentId,
      orderId: payment.orderId.toString(),
      orderNumber: order?.orderId || 'Unknown',
      userId: payment.userId.toString(),
      userName: user?.name || 'Unknown User',
      userEmail: user?.email || 'Unknown Email',
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      stripePaymentIntentId: payment.stripePaymentIntentId,
      stripeCustomerId: payment.stripeCustomerId,
      paymentDetails: payment.paymentDetails,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };

    return NextResponse.json({ payment: transformedPayment });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}