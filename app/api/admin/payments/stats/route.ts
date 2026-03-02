import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
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

    // Get all payments
    const payments = await Payment.find({}).lean();

    // Calculate statistics
    const totalPayments = payments.length;
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    
    const successfulPayments = payments.filter(p => p.status === "succeeded").length;
    const failedPayments = payments.filter(p => p.status === "failed").length;
    
    const refundedAmount = payments
      .filter(p => p.status === "refunded")
      .reduce((sum, p) => sum + p.amount, 0);

    // Payment method distribution
    const paymentMethodDistribution: Record<string, number> = {};
    payments.forEach(payment => {
      paymentMethodDistribution[payment.paymentMethod] = 
        (paymentMethodDistribution[payment.paymentMethod] || 0) + 1;
    });

    // Daily revenue for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyRevenue: Record<string, number> = {};
    payments
      .filter(p => p.status === "succeeded" && new Date(p.createdAt) >= thirtyDaysAgo)
      .forEach(payment => {
        const date = new Date(payment.createdAt).toISOString().split('T')[0];
        dailyRevenue[date] = (dailyRevenue[date] || 0) + payment.amount;
      });

    const dailyRevenueArray = Object.entries(dailyRevenue).map(([date, amount]) => ({
      date,
      amount,
    })).sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      stats: {
        totalPayments,
        totalAmount,
        successfulPayments,
        failedPayments,
        refundedAmount,
        paymentMethodDistribution,
        dailyRevenue: dailyRevenueArray,
      },
    });
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}