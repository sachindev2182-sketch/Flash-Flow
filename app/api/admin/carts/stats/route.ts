import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
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

    // Get all carts
    const carts = await Cart.find({}).lean();

    // Calculate statistics
    const totalCarts = carts.length;
    
    // Calculate total items and value
    let totalItemsInCarts = 0;
    let totalCartValue = 0;
    const categoryDistribution: Record<string, number> = {};

    carts.forEach(cart => {
      cart.items.forEach((item: any) => {
        totalItemsInCarts += item.quantity;
        totalCartValue += item.price * item.quantity;
        
        // Count category distribution
        const category = item.category;
        categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
      });
    });

    // Calculate averages
    const averageCartValue = totalCarts > 0 ? totalCartValue / totalCarts : 0;
    const itemsPerCart = totalCarts > 0 ? totalItemsInCarts / totalCarts : 0;

    // Define active/abandoned carts (updated in last 7 days vs older)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeCarts = carts.filter(cart => 
      new Date(cart.updatedAt) >= sevenDaysAgo
    ).length;

    const abandonedCarts = totalCarts - activeCarts;

    return NextResponse.json({
      stats: {
        totalCarts,
        totalItemsInCarts,
        totalCartValue,
        averageCartValue,
        itemsPerCart,
        abandonedCarts,
        activeCarts,
        categoryDistribution,
      },
    });
  } catch (error) {
    console.error("Error fetching cart stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}