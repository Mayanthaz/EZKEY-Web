import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export type SellerAuthResult =
  | {
      authorized: true;
      user: { id: string; email?: string };
      profile: { role: string; is_verified: boolean; username: string };
      supabase: Awaited<ReturnType<typeof createClient>>;
    }
  | {
      authorized: false;
      response: NextResponse;
    };

/**
 * Enforces authenticated seller role for internal API routes.
 */
export async function requireSellerAuth(): Promise<SellerAuthResult> {
  try {
    let supabase;
    let user;
    try {
      supabase = await createClient();
      const authUser = await supabase.auth.getUser();
      user = authUser.data?.user;
    } catch {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: "Authentication required", code: "UNAUTHORIZED" },
          { status: 401 }
        ),
      };
    }

    if (!user) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: "Authentication required", code: "UNAUTHORIZED" },
          { status: 401 }
        ),
      };
    }

    const [{ data: profile }, { data: verification }] = await Promise.all([
      supabase
        .from("profiles")
        .select("role, is_verified, username")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("seller_verifications")
        .select("application_status, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const isVerifiedSeller =
      profile?.role === "seller" ||
      profile?.role === "admin" ||
      profile?.is_verified === true ||
      verification?.application_status === "verified" ||
      verification?.status === "Approved";

    if (!isVerifiedSeller) {
      return {
        authorized: false,
        response: NextResponse.json(
          {
            error: "Seller access required. Please complete seller verification.",
            code: "FORBIDDEN",
          },
          { status: 403 }
        ),
      };
    }

    return {
      authorized: true,
      user: { id: user.id, email: user.email },
      profile: {
        role: profile?.role || "seller",
        is_verified: true,
        username: profile?.username || user.email?.split("@")[0] || "seller",
      },
      supabase,
    };
  } catch (error) {
    console.error("Seller auth check failed:", error);
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Internal authentication error", code: "SERVER_ERROR" },
        { status: 500 }
      ),
    };
  }
}
