import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle,
  ClipboardCheck,
  Clock,
  FileCheck2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Smartphone,
  Store,
  UserRound,
  WalletCards,
  Sparkles,
} from "lucide-react";
import { BecomeSellerWizard } from "@/components/seller/BecomeSellerWizard";

export const metadata: Metadata = {
  title: "Become a Verified Seller | EZKEY Marketplace",
  description:
    "Apply to become a verified EZKEY merchant. Multi-step onboarding, automated key inventory, and escrow-backed payouts.",
};

const onboardingSteps = [
  {
    title: "Account Setup",
    description: "Verify email and basic contact identity.",
    icon: UserRound,
  },
  {
    title: "Store Profile",
    description: "Set store branding, product categories, and delivery methods.",
    icon: Store,
  },
  {
    title: "Biometric KYC",
    description: "Government ID scan and face liveness verification.",
    icon: ShieldCheck,
  },
  {
    title: "Payout Review",
    description: "Connect verified bank wire, PayPal, or Stripe.",
    icon: WalletCards,
  },
  {
    title: "Instant Selling",
    description: "Unlock Seller Dashboard and start earning.",
    icon: ClipboardCheck,
  },
];

const requiredDocuments = [
  "Government-issued ID: NIC / National ID card, Driver's License, or Passport",
  "Camera-enabled device (desktop or smartphone) for live document scanning",
  "Biometric selfie and real-time liveness check",
  "Valid payout destination (Bank account, PayPal, or Stripe account)",
];

const reviewStages = [
  { label: "Account verification", time: "Instant" },
  { label: "Biometric document KYC", time: "Automated (typically 1-5 mins)" },
  { label: "Payout account verification", time: "Automated / Same day" },
  { label: "Seller Dashboard unlock", time: "Immediately upon approval" },
];

export default function BecomeSellerPage() {
  return (
    <div className="bg-cyber-dark min-h-screen pt-24 pb-20">
      <div className="section-container space-y-12">
        {/* Hero Section */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-neon-purple/30 bg-neon-purple/10 px-4 py-1.5 text-xs font-semibold text-neon-purple shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-neon-purple" />
              Verified Merchant Program
            </div>

            <div>
              <h1 className="font-display text-3xl font-black leading-tight sm:text-5xl text-foreground">
                Sell Digital Assets & Keys on{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple via-neon-blue to-neon-green">
                  EZKEY
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Join thousands of verified sellers. List digital game keys, vouchers, software licenses, and services with escrow payment protection and instant payout transfers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#application-wizard"
                className="btn-neon text-sm !px-6 !py-3 inline-flex items-center gap-2"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Seller Application
                  <ArrowRight className="h-4 w-4" />
                </span>
              </a>
              <Link
                href="/auth/sign-up"
                className="btn-ghost-neon text-sm !px-6 !py-3"
              >
                Create Account
              </Link>
            </div>
          </div>

          {/* Checklist Card */}
          <div className="glass-card p-6 sm:p-7 border border-cyber-border">
            <div className="flex items-center gap-3 border-b border-cyber-border pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-green/10 border border-neon-green/20">
                <BadgeCheck className="h-5 w-5 text-neon-green" />
              </div>
              <div>
                <h2 className="font-display text-sm font-bold">5-Step Seller Journey</h2>
                <p className="text-xs text-muted-foreground">
                  Streamlined, secure, and fully automated verification
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3.5">
              {onboardingSteps.map((step, index) => (
                <div key={step.title} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyber-border bg-cyber-surface/60">
                      <step.icon className="h-4 w-4 text-neon-purple" />
                    </div>
                    {index < onboardingSteps.length - 1 && (
                      <div className="h-full w-px bg-cyber-border/60 my-1" />
                    )}
                  </div>
                  <div className="pb-2">
                    <h3 className="text-xs font-bold text-foreground">{step.title}</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Value Props Row */}
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="glass-card p-5 group hover:border-neon-blue/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center mb-3">
              <Smartphone className="h-5 w-5 text-neon-blue" />
            </div>
            <h3 className="font-display text-sm font-bold">Account Security</h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              MFA authentication and anti-takeover protections safeguard seller revenue and vaults.
            </p>
          </div>

          <div className="glass-card p-5 group hover:border-neon-green/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-neon-green/10 border border-neon-green/20 flex items-center justify-center mb-3">
              <FileCheck2 className="h-5 w-5 text-neon-green" />
            </div>
            <h3 className="font-display text-sm font-bold">Biometric Verification</h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Automated document scanning, liveness matching, and fraud screening via Didit SDK.
            </p>
          </div>

          <div className="glass-card p-5 group hover:border-neon-purple/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center mb-3">
              <Clock className="h-5 w-5 text-neon-purple" />
            </div>
            <h3 className="font-display text-sm font-bold">Instant Key Vault</h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Automate key distribution with 24/7 delivery and escrow release directly to your ledger.
            </p>
          </div>
        </div>

        {/* Wizard Application Section */}
        <div id="application-wizard" className="scroll-mt-24 space-y-4">
          <div>
            <h2 className="font-display text-2xl font-bold">Seller Application Wizard</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Complete the 3 quick steps below to initiate your verification session.
            </p>
          </div>

          <BecomeSellerWizard />
        </div>

        {/* Documents and Review Info */}
        <div className="grid gap-6 md:grid-cols-2 pt-4">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-5 w-5 text-neon-green" />
              <h3 className="font-display text-sm font-bold">Documents Checklist</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              {requiredDocuments.map((doc) => (
                <li key={doc} className="flex items-start gap-2.5">
                  <CheckCircle className="h-4 w-4 text-neon-green shrink-0 mt-0.5" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-5 w-5 text-neon-blue" />
              <h3 className="font-display text-sm font-bold">Review Pipeline Timeline</h3>
            </div>
            <div className="space-y-2.5">
              {reviewStages.map((stage) => (
                <div
                  key={stage.label}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-cyber-border bg-white/[0.01] text-xs"
                >
                  <span className="font-medium text-foreground">{stage.label}</span>
                  <span className="text-muted-foreground">{stage.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
