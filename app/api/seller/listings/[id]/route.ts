import { requireSellerAuth } from "@/lib/seller/auth";
import {
  getListingById,
  updateSellerListing,
  deleteSellerListing,
} from "@/lib/seller/store";
import { updateListingSchema } from "@/lib/validations/seller";
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
  const listing = getListingById(auth.user.id, id);

  if (!listing) {
    return NextResponse.json(
      { error: "Listing not found or access denied", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, listing });
}

export async function PUT(
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
    const result = updateListingSchema.safeParse(json);

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

    const updated = updateSellerListing(auth.user.id, id, result.data);
    if (!updated) {
      return NextResponse.json(
        { error: "Listing not found or unauthorized", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, listing: updated });
  } catch (error) {
    console.error("Failed to update listing:", error);
    return NextResponse.json(
      { error: "Failed to update listing", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSellerAuth();
  if (!auth.authorized) {
    return auth.response;
  }

  const { id } = await params;
  const success = deleteSellerListing(auth.user.id, id);

  if (!success) {
    return NextResponse.json(
      { error: "Listing not found or unable to delete", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, message: "Listing deleted" });
}
