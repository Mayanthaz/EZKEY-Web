import { requireSellerAuth } from "@/lib/seller/auth";
import { getSellerPayouts, requestSellerPayout } from "@/lib/seller/store";
import { payoutRequestSchema } from "@/lib/validations/seller";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
  const auth = await requireSellerAuth();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const data = getSellerPayouts(auth.user.id);
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error("Failed to fetch payouts:", error);
    return NextResponse.json(
      { error: "Failed to fetch payout records", code: "SERVER_ERROR" },
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
    const result = payoutRequestSchema.safeParse(json);

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

    const payout = requestSellerPayout(
      auth.user.id,
      result.data.amount,
      result.data.method,
      result.data.destination
    );

    return NextResponse.json({
      success: true,
      message: `Payout request for $${payout.amount.toFixed(2)} submitted successfully`,
      payout,
    });
  } catch (error: any) {
    console.error("Payout request error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process payout request", code: "BAD_REQUEST" },
      { status: 400 }
    );
  }
}
