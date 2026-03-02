import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get("authToken")?.value;

  if (!token) {
    redirect("/login");
  }

  let decoded;

  try {
    decoded = await adminAuth.verifySessionCookie(token, true);
  } catch (err) {
    console.error("Session verify error (admin):", err);
    redirect("/login");
  }

  await connectDB();

  const user = await User.findOne({ email: decoded.email });

  if (!user || user.role !== "admin") {
    redirect("/home");
  }

  return <>{children}</>;
}
