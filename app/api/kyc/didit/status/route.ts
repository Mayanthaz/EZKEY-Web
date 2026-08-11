import { NextRequest, NextResponse } from "next/server";

import { retrieveDiditDecision } from "@/lib/didit";
import {
  applySellerVerificationUpdate,
  getVerificationUrl,
  statusFromDiditDecision,
} from "@/lib/seller-verification";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type SellerVerificationRow = {
  didit_session_id: string;
  status: string;
  application_status: string;
  verification_url: string | null;
  submitted_details: Record<string, unknown> | null;
  created_at: string;
};

function readText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getBusinessName(submittedDetails: Record<string, unknown> | null) {
  return readText(submittedDetails?.store_name);
}

function getBusinessEmail(submittedDetails: Record<string, unknown> | null) {
  return readText(submittedDetails?.email);
}

function getPayoutMethod(submittedDetails: Record<string, unknown> | null) {
  const value = readText(submittedDetails?.payout_method);

  if (value === "paypal" || value === "stripe") {
    return value;
  }

  return "bank_transfer";
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Please log in to view seller verification status." },
      { status: 401 },
    );
  }

  const baseQuery = supabase
    .from("seller_verifications")
    .select(
      "didit_session_id,status,application_status,verification_url,submitted_details,created_at",
    )
    .eq("user_id", user.id);

  const query = sessionId
    ? baseQuery.eq("didit_session_id", sessionId)
    : baseQuery.order("created_at", { ascending: false }).limit(1);

  const { data, error } = await query.maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Unable to load seller verification status." },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "No seller verification session was found." },
      { status: 404 },
    );
  }

  const verification = data as SellerVerificationRow;
  const admin = createAdminClient();

  if (!admin) {
    return NextResponse.json({
      sessionId: verification.didit_session_id,
      status: verification.status,
      applicationStatus: verification.application_status,
      verificationUrl: verification.verification_url,
      refreshError:
        "Status refresh is not configured. Add SUPABASE_SERVICE_ROLE_KEY.",
    });
  }

  try {
    const decision = await retrieveDiditDecision(verification.didit_session_id);
    const status = statusFromDiditDecision(decision, verification.status);
    const { applicationStatus, approved } = await applySellerVerificationUpdate(
      admin,
      {
        userId: user.id,
        sessionId: verification.didit_session_id,
        status,
        sessionNumber: decision.session_number,
        workflowId: decision.workflow_id,
        vendorData: decision.vendor_data,
        verificationUrl: getVerificationUrl(decision) || verification.verification_url,
        metadata: decision.metadata,
        rawDecision: decision,
        businessName: getBusinessName(verification.submitted_details),
        businessEmail: getBusinessEmail(verification.submitted_details),
        payoutMethod: getPayoutMethod(verification.submitted_details),
      },
    );

    return NextResponse.json({
      sessionId: verification.didit_session_id,
      status,
      applicationStatus,
      approved,
      verificationUrl: getVerificationUrl(decision) || verification.verification_url,
    });
  } catch (refreshError) {
    return NextResponse.json({
      sessionId: verification.didit_session_id,
      status: verification.status,
      applicationStatus: verification.application_status,
      verificationUrl: verification.verification_url,
      refreshError:
        refreshError instanceof Error
          ? refreshError.message
          : "Unable to refresh Didit status yet.",
    });
  }
}
