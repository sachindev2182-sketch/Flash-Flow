import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import Wishlist from "@/models/Wishlist";
import User from "@/models/User";

interface WishlistItem {
  productId: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  addedAt: Date;
}

interface WishlistDocument {
  userId: string;
  items: WishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
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

    const { userId } = await params;

    const user = await User.findOne({
      $or: [
        { uid: userId },
        { userId: userId },
        { firebaseUid: userId },
        { _id: userId }
      ]
    });

    if (!user) {
      console.log(`User not found for ID: ${userId}`);
      return NextResponse.json({
        userId,
        userName: 'Unknown User',
        userEmail: 'No email',
        items: [],
        totalItems: 0,
        totalValue: 0,
        createdAt: null,
        updatedAt: null,
      });
    }

    // Get user's wishlist
    const wishlist = await Wishlist.findOne({ userId }).lean() as WishlistDocument | null;

    if (!wishlist) {
      return NextResponse.json({
        userId,
        userName: user.name || user.displayName || user.email?.split('@')[0] || 'Unknown User',
        userEmail: user.email || 'No email',
        items: [],
        totalItems: 0,
        totalValue: 0,
        createdAt: null,
        updatedAt: null,
      });
    }

    // Transform wishlist data
    const transformedWishlist = {
      userId: wishlist.userId,
      userName: user.name || user.displayName || user.email?.split('@')[0] || 'Unknown User',
      userEmail: user.email || 'No email',
      items: wishlist.items.map((item: WishlistItem) => ({
        ...item,
        addedAt: item.addedAt.toISOString(),
      })),
      totalItems: wishlist.items.length,
      totalValue: wishlist.items.reduce((sum: number, item: WishlistItem) => sum + item.price, 0),
      createdAt: wishlist.createdAt?.toISOString() || null,
      updatedAt: wishlist.updatedAt.toISOString(),
    };

    return NextResponse.json(transformedWishlist);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}