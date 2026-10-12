import { NextRequest, NextResponse } from "next/server";
import { applySellerVerificationUpdate } from "@/lib/seller-verification";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";

export async function POST(request: NextRequest) {
  if (!hasEnvVars) {
    return NextResponse.json(
      { error: "Authentication is not configured." },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Please log in to finalize seller verification." },
      { status: 401 },
    );
  }

  let sessionId: string | undefined;

  try {
    const body = await request.json();
    sessionId = typeof body?.sessionId === "string" ? body.sessionId : undefined;
  } catch {
    // Body is optional
  }

  const effectiveSessionId =
    sessionId || `inbuilt_${user.id.slice(0, 8)}_${Date.now()}`;

  const admin = createAdminClient();

  if (!admin) {
    return NextResponse.json(
      { error: "Seller verification storage is not configured. Add SUPABASE_SERVICE_ROLE_KEY." },
      { status: 500 },
    );
  }

  try {
    // Check if an existing session exists for this user
    const { data: existingVerification } = await admin
      .from("seller_verifications")
      .select("didit_session_id, submitted_details")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const targetSessionId =
      sessionId || existingVerification?.didit_session_id || effectiveSessionId;

    const submittedDetails = existingVerification?.submitted_details || {};
    const businessName =
      typeof submittedDetails.store_name === "string"
        ? submittedDetails.store_name
        : user.user_metadata?.store_name || "Merchant Store";
    const businessEmail =
      typeof submittedDetails.email === "string"
        ? submittedDetails.email
        : user.email;
    const payoutMethod =
      typeof submittedDetails.payout_method === "string"
        ? submittedDetails.payout_method
        : "bank_transfer";

    const { applicationStatus, approved } = await applySellerVerificationUpdate(
      admin,
      {
        userId: user.id,
        sessionId: targetSessionId,
        status: "Approved",
        workflowId: "inbuilt_biometric_kyc",
        submittedDetails: {
          ...submittedDetails,
          verified_at: new Date().toISOString(),
          verification_method: "inbuilt_camera_biometrics",
        },
        businessName,
        businessEmail,
        payoutMethod,
      },
    );

    return NextResponse.json({
      success: true,
      sessionId: targetSessionId,
      status: "Approved",
      applicationStatus,
      approved,
      message: "Merchant KYC verification approved and seller tools unlocked.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to approve verification.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
