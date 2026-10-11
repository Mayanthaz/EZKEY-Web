import { requireSellerAuth } from "@/lib/seller/auth";
import { fulfillSellerOrder } from "@/lib/seller/store";
import { fulfillOrderSchema } from "@/lib/validations/seller";
import { NextResponse } from "next/server";


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
    const result = fulfillOrderSchema.safeParse({ ...json, order_id: id });

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

    const order = fulfillSellerOrder(
      auth.user.id,
      id,
      result.data.keys,
      result.data.delivery_note
    );

    return NextResponse.json({
      success: true,
      message: `Order ${order.order_number} successfully fulfilled and delivered`,
      order,
    });
  } catch (error: any) {
    console.error("Order fulfillment error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fulfill order", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
