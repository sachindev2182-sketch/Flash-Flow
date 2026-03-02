import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import mongoose from "mongoose";

export async function PUT(
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
        { error: "Invalid order ID format" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status } = body;

    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Update order status
    order.orderStatus = status;
    
    // If order is delivered, update payment status if needed
    if (status === "delivered" && order.paymentMethod === "cod") {
      order.paymentStatus = "completed";
    }

    await order.save();

    // Get user details for response
    const user = await User.findById(order.userId).select('name email').lean();

    const transformedOrder = {
      _id: order._id.toString(),
      orderId: order.orderId,
      userId: order.userId.toString(),
      userName: user?.name || 'Unknown User',
      userEmail: user?.email || 'Unknown Email',
      items: order.items.map((item: any) => ({
        ...item,
        productId: item.productId.toString(),
      })),
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      subtotal: order.subtotal,
      deliveryCharge: order.deliveryCharge,
      totalAmount: order.totalAmount,
      paymentId: order.paymentId,
      stripePaymentIntentId: order.stripePaymentIntentId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return NextResponse.json({ order: transformedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}