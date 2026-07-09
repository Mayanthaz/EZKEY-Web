import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { createClient } from "@/lib/supabase/server";

type SellerDashboardGateProps = {
  children: ReactNode;
};

export default async function SellerDashboardGate({
  children,
}: SellerDashboardGateProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [{ data: profile }, { data: verification, error: verificationError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("role,is_verified")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("seller_verifications")
        .select("application_status,status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const profileApproved =
    profile?.role === "seller" && profile?.is_verified === true;
  const verificationApproved =
    !verificationError &&
    (verification?.application_status === "verified" ||
      verification?.status === "Approved");

  if (!profileApproved && !verificationApproved) {
    redirect("/become-a-seller");
  }

  return <>{children}</>;
}
