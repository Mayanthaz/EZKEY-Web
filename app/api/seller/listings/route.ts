import { requireSellerAuth } from "@/lib/seller/auth";
import { getSellerListings, createSellerListing } from "@/lib/seller/store";
import { createListingSchema } from "@/lib/validations/seller";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
  const auth = await requireSellerAuth();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const listings = getSellerListings(auth.user.id);
    return NextResponse.json({ success: true, listings });
  } catch (error) {
    console.error("Failed to fetch listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireSellerAuth();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const json = await request.json();
    const result = createListingSchema.safeParse(json);

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

    const listing = createSellerListing(auth.user.id, result.data);
    return NextResponse.json({ success: true, listing }, { status: 201 });
  } catch (error) {
    console.error("Failed to create listing:", error);
    return NextResponse.json(
      { error: "Failed to create listing", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
