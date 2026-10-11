import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  BadgeCheck,
  Clock,
  Sparkles,
  LockKeyhole,
  CheckCircle,
  HelpCircle,
  FileCheck2,
  WalletCards,
  ArrowRight,
  Headphones,
  KeyRound,
  Zap,
} from "lucide-react";
import { BecomeSellerWizard } from "@/components/seller/BecomeSellerWizard";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Merchant Application & KYC Verification | EZKEY Marketplace",
  description:
    "Apply to become a verified EZKEY seller. Fill your merchant profile, connect payouts, and verify identity with Didit biometric scanning.",
};

const requiredDocuments = [
  {
    title: "Government-Issued Identity Document",
    desc: "National ID (NIC), Valid Driver's License, or International Passport.",
  },
  {
    title: "Live Camera Device",
    desc: "Smartphone or desktop webcam for 3D face liveness scanning.",
  },
  {
    title: "Verified Payout Rail",
    desc: "Direct Bank Wire / ACH, PayPal Merchant, or Stripe Connect.",
  },
  {
    title: "Product Sourcing Proof",
    desc: "Legitimately obtained digital game keys, licenses, or accounts.",
  },
];

const reviewStages = [
  { label: "Account Setup", time: "Instant", icon: Zap },
  { label: "Didit Biometric KYC", time: "1 - 5 mins automated", icon: ShieldCheck },
  { label: "Payout Route Approval", time: "Automated check", icon: WalletCards },
  { label: "Seller Dashboard Unlock", time: "Immediately upon pass", icon: KeyRound },
];

const faqs = [
  {
    q: "How fast is seller verification approved?",
    a: "Didit performs automated real-time biometric and document checks. Most applications complete within 2 to 5 minutes.",
  },
  {
    q: "Do I need a registered corporate entity to sell?",
    a: "No. Individual private merchants are fully supported. Simply select 'Individual Private Merchant' in Step 1.",
  },
  {
    q: "How does the key vault inventory work?",
    a: "Once approved, you can batch-upload encrypted keys to your inventory vault. When a buyer completes payment, keys are delivered instantly without manual intervention.",
  },
  {
    q: "When are sales funds released from escrow?",
    a: "Escrow funds are released to your seller balance once the buyer confirms key activation or after the auto-completion window (usually 24 hours).",
  },
];

export default function BecomeSellerPage() {
  return (
    <div className="bg-cyber-dark min-h-screen pt-24 pb-20">
      <div className="section-container max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Header Banner */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-neon-purple font-medium">Merchant Onboarding Portal</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-2 border-b border-cyber-border/40">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-neon-purple/30 bg-neon-purple/10 px-3.5 py-1 text-xs font-semibold text-neon-purple">
                <Sparkles className="h-3.5 w-3.5 text-neon-purple" />
                Verified Merchant Application
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
                Apply to Sell on{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple via-neon-blue to-neon-green">
                  EZKEY
                </span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Complete your 3-step merchant profile below. Once identity verification is completed via Didit, your automated key vault and instant payouts will unlock immediately.
              </p>
            </div>

            {/* Platform Highlights */}
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <Badge variant="outline" className="border-neon-green/30 bg-neon-green/5 text-neon-green text-xs py-1 px-3">
                <BadgeCheck className="w-3.5 h-3.5 mr-1.5" /> 0% Listing Fee
              </Badge>
              <Badge variant="outline" className="border-neon-blue/30 bg-neon-blue/5 text-neon-blue text-xs py-1 px-3">
                <LockKeyhole className="w-3.5 h-3.5 mr-1.5" /> Escrow Protected
              </Badge>
              <Badge variant="outline" className="border-neon-purple/30 bg-neon-purple/5 text-neon-purple text-xs py-1 px-3">
                <KeyRound className="w-3.5 h-3.5 mr-1.5" /> 24/7 Key Automation
              </Badge>
            </div>
          </div>
        </div>

        {/* 2-COLUMN APPLICATION PORTAL EXPERIENCE */}
        <div className="grid gap-8 lg:grid-cols-[320px_1fr] items-start">
          {/* Left Column: Requirements, Verification Checklist & Timeline */}
          <div className="space-y-6 lg:sticky lg:top-28">
            {/* Document Checklist Card */}
            <div className="glass-card p-6 border border-cyber-border rounded-2xl space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-cyber-border/60">
                <div className="w-9 h-9 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5 text-neon-purple" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-foreground">
                    Required Checklist
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Have these ready before starting
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                {requiredDocuments.map((doc, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <CheckCircle className="w-4 h-4 text-neon-green shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">{doc.title}</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                        {doc.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pipeline Timeline Card */}
            <div className="glass-card p-6 border border-cyber-border rounded-2xl space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-cyber-border/60">
                <div className="w-9 h-9 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-neon-blue" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-foreground">
                    Review Pipeline
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Expected processing times
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {reviewStages.map((stage) => {
                  const Icon = stage.icon;
                  return (
                    <div
                      key={stage.label}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-cyber-border bg-white/[0.01] text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-neon-purple shrink-0" />
                        <span className="font-medium text-foreground">{stage.label}</span>
                      </div>
                      <span className="text-[11px] text-neon-green font-semibold">
                        {stage.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Support / Quick Contact */}
            <div className="p-4 rounded-2xl border border-cyber-border bg-white/[0.01] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Headphones className="w-4 h-4 text-neon-purple" />
                <span className="text-xs text-muted-foreground">Need help onboarding?</span>
              </div>
              <Link
                href="/contact"
                className="text-xs font-semibold text-neon-purple hover:underline"
              >
                Contact Support
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Form Filling Experience */}
          <div className="min-w-0">
            <BecomeSellerWizard />
          </div>
        </div>

        {/* Seller FAQs */}
        <div className="pt-8 border-t border-cyber-border/40">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-5 h-5 text-neon-purple" />
            <h2 className="font-display text-lg font-bold text-foreground">
              Frequently Asked Questions About Selling
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="glass-card p-5 border border-cyber-border rounded-xl space-y-2"
              >
                <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-neon-purple shrink-0" />
                  {faq.q}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed pl-3.5">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
