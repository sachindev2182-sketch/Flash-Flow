import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import User from "@/models/User";
import Product from "@/models/Product";
import mongoose from "mongoose";

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

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const filterBy = searchParams.get("filterBy") || "all";
    const filterValue = searchParams.get("filterValue") || "";
    const sortBy = searchParams.get("sortBy") || "newest";

    const skip = (page - 1) * limit;

    // Get all carts
    const carts = await Cart.find({})
      .sort({ updatedAt: -1 })
      .lean();

    // Get all users to map user details
    const allUsers = await User.find({}).select('name email').lean();
    const userMap = new Map(allUsers.map(u => [u._id.toString(), u]));

    // Transform carts with user details
    let transformedCarts = carts.map(cart => ({
      _id: cart._id.toString(),
      userId: cart.userId.toString(),
      userName: userMap.get(cart.userId.toString())?.name || 'Unknown User',
      userEmail: userMap.get(cart.userId.toString())?.email || 'Unknown Email',
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
    }));

    // Apply search filter (search in user name or email)
    if (search) {
      transformedCarts = transformedCarts.filter(cart =>
        cart.userName.toLowerCase().includes(search.toLowerCase()) ||
        cart.userEmail.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply filter by user
    if (filterBy === 'user' && filterValue) {
      transformedCarts = transformedCarts.filter(cart =>
        cart.userName.toLowerCase().includes(filterValue.toLowerCase()) ||
        cart.userEmail.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    // Apply filter by category (search in cart items)
    if (filterBy === 'category' && filterValue) {
      transformedCarts = transformedCarts.filter(cart =>
        cart.items.some(item => 
          item.category.toLowerCase().includes(filterValue.toLowerCase())
        )
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        transformedCarts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case 'oldest':
        transformedCarts.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
        break;
      case 'highest':
        transformedCarts.sort((a, b) => b.totalValue - a.totalValue);
        break;
      case 'lowest':
        transformedCarts.sort((a, b) => a.totalValue - b.totalValue);
        break;
    }

    const total = transformedCarts.length;
    const paginatedCarts = transformedCarts.slice(skip, skip + limit);

    return NextResponse.json({
      carts: paginatedCarts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching carts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}