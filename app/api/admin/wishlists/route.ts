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

interface TransformedWishlist {
  userId: string;
  userName: string;
  userEmail: string;
  items: Array<Omit<WishlistItem, 'addedAt'> & { addedAt: string }>;
  totalItems: number;
  totalValue: number;
  createdAt: string | null;
  updatedAt: string;
}

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

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const userFilter = searchParams.get("user") || "";

    const skip = (page - 1) * limit;

    // Get all wishlists
    const wishlists = await Wishlist.find({})
      .sort({ updatedAt: -1 })
      .lean() as WishlistDocument[];

    const allUsers = await User.find({}).select('name email uid userId firebaseUid');
    
    const userMap = new Map();
    allUsers.forEach(user => {
      const possibleIds = [
        user.uid,
        user.userId,
        user.firebaseUid,
        user._id?.toString()
      ].filter(Boolean); 
      
      // Store user data for each possible ID
      possibleIds.forEach(id => {
        if (id) {
          userMap.set(id.toString(), {
            name: user.name || user.displayName || user.email?.split('@')[0] || 'Unknown User',
            email: user.email || 'No email'
          });
        }
      });
    });

    if (wishlists.length > 0) {
      console.log('Sample wishlist userId:', wishlists[0].userId);
      console.log('Sample user from map:', userMap.get(wishlists[0].userId));
    }

    let transformedWishlists: TransformedWishlist[] = wishlists.map(wishlist => {
      const userData = userMap.get(wishlist.userId);
      
      let userName = 'Unknown User';
      let userEmail = 'No email';
      
      if (userData) {
        userName = userData.name;
        userEmail = userData.email;
      } else {
        console.log(`User not found for userId: ${wishlist.userId}`);
      }
      
      return {
        userId: wishlist.userId,
        userName: userName,
        userEmail: userEmail,
        items: wishlist.items.map((item: WishlistItem) => ({
          ...item,
          addedAt: item.addedAt.toISOString(),
        })),
        totalItems: wishlist.items.length,
        totalValue: wishlist.items.reduce((sum: number, item: WishlistItem) => sum + item.price, 0),
        createdAt: wishlist.createdAt?.toISOString() || null,
        updatedAt: wishlist.updatedAt.toISOString(),
      };
    });

    if (search) {
      transformedWishlists = transformedWishlists.filter(wishlist =>
        wishlist.items.some(item =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    if (userFilter) {
      transformedWishlists = transformedWishlists.filter(wishlist =>
        wishlist.userName.toLowerCase().includes(userFilter.toLowerCase()) ||
        wishlist.userEmail.toLowerCase().includes(userFilter.toLowerCase())
      );
    }

    const total = transformedWishlists.length;
    const paginatedWishlists = transformedWishlists.slice(skip, skip + limit);

    return NextResponse.json({
      wishlists: paginatedWishlists,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching wishlists:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}