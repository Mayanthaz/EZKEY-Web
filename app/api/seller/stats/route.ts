import { requireSellerAuth } from "@/lib/seller/auth";
import { getSellerStats } from "@/lib/seller/store";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
  const auth = await requireSellerAuth();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const stats = getSellerStats(auth.user.id);
    return NextResponse.json({ success: true, ...stats });
  } catch (error) {
    console.error("Failed to fetch seller stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
