import { requireSellerAuth } from "@/lib/seller/auth";
import { getListingKeys, addListingKeys } from "@/lib/seller/store";
import { addKeysSchema } from "@/lib/validations/seller";
import { NextResponse } from "next/server";


export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSellerAuth();
  if (!auth.authorized) {
    return auth.response;
  }

  const { id } = await params;
  const keys = getListingKeys(auth.user.id, id);

  // Return masked keys for display security
  const masked = keys.map((k) => ({
    id: k.id,
    masked_code:
      k.key_code.length > 8
        ? `${k.key_code.slice(0, 4)}-••••-••••-${k.key_code.slice(-4)}`
        : "••••-••••",
    status: k.status,
    created_at: k.created_at,
  }));

  return NextResponse.json({
    success: true,
    total: keys.length,
    available: keys.filter((k) => k.status === "available").length,
    sold: keys.filter((k) => k.status === "sold").length,
    keys: masked,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSellerAuth();
  if (!auth.authorized) {
    return auth.response;
  }

  const { id } = await params;

  try {
    const json = await request.json();
    const result = addKeysSchema.safeParse({ ...json, listing_id: id });

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

    const { addedCount, newStock } = addListingKeys(
      auth.user.id,
      id,
      result.data.keys
    );

    return NextResponse.json({
      success: true,
      message: `Successfully added ${addedCount} key(s) to vault`,
      addedCount,
      newStock,
    });
  } catch (error: any) {
    console.error("Failed to add keys to vault:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to add keys", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
