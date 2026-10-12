import { requireSellerAuth } from "@/lib/seller/auth";
import { getSellerSettings, updateSellerSettings } from "@/lib/seller/store";
import { sellerSettingsSchema } from "@/lib/validations/seller";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
  const auth = await requireSellerAuth();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const settings = getSellerSettings(auth.user.id);
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Failed to fetch seller settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch store settings", code: "SERVER_ERROR" },
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
    const json = await request.json();
    const result = sellerSettingsSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const updated = updateSellerSettings(auth.user.id, result.data);
    return NextResponse.json({
      success: true,
      message: "Store settings updated successfully",
      settings: updated,
    });
  } catch (error) {
    console.error("Failed to update seller settings:", error);
    return NextResponse.json(
      { error: "Failed to update store settings", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
