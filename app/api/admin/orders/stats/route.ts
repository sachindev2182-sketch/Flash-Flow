import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";

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

    // Check if user is admin
    const adminUser = await User.findOne({ email: decoded.email });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all orders
    const orders = await Order.find({}).lean();

    // Calculate statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const pendingOrders = orders.filter(o => o.orderStatus === "pending").length;
    const completedOrders = orders.filter(o => o.orderStatus === "delivered").length;
    const cancelledOrders = orders.filter(o => o.orderStatus === "cancelled").length;

    // Status distribution
    const statusDistribution: Record<string, number> = {};
    orders.forEach(order => {
      statusDistribution[order.orderStatus] = (statusDistribution[order.orderStatus] || 0) + 1;
    });

    // Payment method distribution
    const paymentMethodDistribution: Record<string, number> = {};
    orders.forEach(order => {
      paymentMethodDistribution[order.paymentMethod] = (paymentMethodDistribution[order.paymentMethod] || 0) + 1;
    });

    return NextResponse.json({
      stats: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        statusDistribution,
        paymentMethodDistribution,
      },
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}