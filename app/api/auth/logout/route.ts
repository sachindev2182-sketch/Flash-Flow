export const runtime = "nodejs";
import { NextResponse } from "next/server";

// Support both GET and POST for logout
export async function GET() {
  return handleLogout();
}

export async function POST() {
  return handleLogout();
}

function handleLogout() {
  const response = NextResponse.json({ message: "Logged out successfully" });

  response.cookies.set("authToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0), 
  });

  return response;
}