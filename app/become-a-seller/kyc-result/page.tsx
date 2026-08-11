import type { Metadata } from "next";
import { Suspense } from "react";

import { KycResultStatus } from "@/components/seller/KycResultStatus";

export const metadata: Metadata = {
  title: "Seller KYC Result",
  description: "Review your live Didit seller verification result on EZKEY.",
};

function KycResultFallback() {
  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-cyber-border bg-cyber-card/70 p-6 text-center">
      <div className="mx-auto h-14 w-14 animate-pulse rounded-2xl bg-neon-purple/10" />
      <div className="mx-auto mt-5 h-7 w-56 animate-pulse rounded bg-cyber-surface" />
      <div className="mx-auto mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-cyber-surface" />
    </div>
  );
}

export default function SellerKycResultPage() {
  return (
    <div className="min-h-screen bg-cyber-dark pt-28 pb-20">
      <section className="section-container">
        <Suspense fallback={<KycResultFallback />}>
          <KycResultStatus />
        </Suspense>
      </section>
    </div>
  );
}
