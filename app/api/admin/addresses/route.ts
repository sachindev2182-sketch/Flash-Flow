import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import Address from "@/models/Address";
import User from "@/models/User";
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

    // Build filter
    let filter: any = {};

    // Handle different filter types
    if (filterBy === "city" && filterValue) {
      filter.city = { $regex: filterValue, $options: "i" };
    } else if (filterBy === "state" && filterValue) {
      filter.state = { $regex: filterValue, $options: "i" };
    } else if (filterBy === "type" && filterValue) {
      filter.addressType = filterValue;
    }

    // Search in address fields
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { houseNumber: { $regex: search, $options: "i" } },
        { street: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { state: { $regex: search, $options: "i" } },
        { pincode: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort
    let sort: any = {};
    switch (sortBy) {
      case "newest":
        sort = { createdAt: -1 };
        break;
      case "oldest":
        sort = { createdAt: 1 };
        break;
      case "name":
        sort = { fullName: 1, createdAt: -1 };
        break;
      case "city":
        sort = { city: 1, createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Get addresses with pagination
    const addresses = await Address.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get user details for each address
    const userIds = [...new Set(addresses.map(a => a.userId.toString()))];
    const users = await User.find({ _id: { $in: userIds } })
      .select('name email')
      .lean();

    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    // Transform addresses with user details
    const transformedAddresses = addresses.map(address => ({
      _id: address._id.toString(),
      userId: address.userId.toString(),
      userName: userMap.get(address.userId.toString())?.name || 'Unknown User',
      userEmail: userMap.get(address.userId.toString())?.email || 'Unknown Email',
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      houseNumber: address.houseNumber,
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault,
      addressType: address.addressType,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    }));

    // If filterBy is 'user', filter after getting user data
    let filteredAddresses = transformedAddresses;
    if (filterBy === 'user' && filterValue) {
      filteredAddresses = transformedAddresses.filter(addr => 
        addr.userName.toLowerCase().includes(filterValue.toLowerCase()) ||
        addr.userEmail.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    const total = filteredAddresses.length;
    const paginatedAddresses = filteredAddresses.slice(0, limit);

    return NextResponse.json({
      addresses: paginatedAddresses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}