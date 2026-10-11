import { requireSellerAuth } from "@/lib/seller/auth";
import {
  getSellerNotifications,
  markNotificationRead,
} from "@/lib/seller/store";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
  const auth = await requireSellerAuth();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const notifications = getSellerNotifications(auth.user.id);
    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    console.error("Failed to fetch seller notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const auth = await requireSellerAuth();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Notification ID required", code: "BAD_REQUEST" },
        { status: 400 }
      );
    }

    markNotificationRead(auth.user.id, id);
    return NextResponse.json({ success: true, message: "Marked as read" });
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return NextResponse.json(
      { error: "Failed to update notification", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
