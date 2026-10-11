import { requireSellerAuth } from "@/lib/seller/auth";
import { getSellerOrders } from "@/lib/seller/store";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
  const auth = await requireSellerAuth();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");

    let orders = getSellerOrders(auth.user.id);

    if (statusFilter && statusFilter !== "all") {
      orders = orders.filter((o) => o.status === statusFilter);
    }

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Failed to fetch seller orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
