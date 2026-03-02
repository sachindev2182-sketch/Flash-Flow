import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const now = new Date();

    // Dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);

    const monthAgo = new Date();
    monthAgo.setDate(now.getDate() - 30);

    // ==============================
    // ONLY NORMAL USERS FILTER
    // ==============================
    const userFilter = { role: "user" };

    // Total users
    const totalUsers = await User.countDocuments(userFilter);

    // Active users
    const active7Days = await User.countDocuments({
      ...userFilter,
      lastActive: { $gte: weekAgo },
    });

    const active30Days = await User.countDocuments({
      ...userFilter,
      lastActive: { $gte: monthAgo },
    });

    // New registrations
    const newToday = await User.countDocuments({
      ...userFilter,
      createdAt: { $gte: today },
    });

    const newWeek = await User.countDocuments({
      ...userFilter,
      createdAt: { $gte: weekAgo },
    });

    // Verified vs unverified
    const verified = await User.countDocuments({
      ...userFilter,
      isVerified: true,
    });

    const unverified = await User.countDocuments({
      ...userFilter,
      isVerified: false,
    });

    // Daily new users (last 7 days)
    const last7Days = new Date();
    last7Days.setDate(now.getDate() - 6);

    const dailyUsers = await User.aggregate([
      {
        $match: {
          role: "user",
          createdAt: { $gte: last7Days },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return NextResponse.json({
      totalUsers,
      active7Days,
      active30Days,
      newToday,
      newWeek,
      verified,
      unverified,
      dailyUsers,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
