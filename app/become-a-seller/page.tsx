import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Building2,
  Camera,
  CheckCircle,
  ClipboardCheck,
  Clock,
  FileCheck2,
  FileText,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Smartphone,
  Store,
  UserRound,
  WalletCards,
} from "lucide-react";

import { DiditKycButton } from "@/components/seller/DiditKycButton";

export const metadata: Metadata = {
  title: "Become a Seller",
  description:
    "Apply to become a verified EZKEY seller. Complete account, identity, payout, and seller policy verification before listing digital products.",
};

const onboardingSteps = [
  {
    title: "Create account",
    description: "Sign up or log in, then verify your email and mobile number.",
    icon: UserRound,
  },
  {
    title: "Seller profile",
    description: "Tell us what you sell, your store name, support hours, and delivery method.",
    icon: Store,
  },
  {
    title: "KYC verification",
    description: "Submit a government ID, proof of address, and selfie/liveness check.",
    icon: ShieldCheck,
  },
  {
    title: "Payout review",
    description: "Add payout details that match your verified identity or business.",
    icon: WalletCards,
  },
  {
    title: "Policy approval",
    description: "Accept seller rules for legal products, delivery proof, and on-platform trading.",
    icon: ClipboardCheck,
  },
];

const requiredDocuments = [
  "Government-issued ID: NIC/national ID, driving licence, or passport",
  "A camera-enabled mobile or desktop browser for live document capture",
  "Selfie/liveness check from the same applicant",
  "Proof of address if the active Didit workflow requests it",
  "Business registration documents if applying as a company",
  "Payout account or wallet under the verified seller or business name",
];

const sellerRules = [
  "Sell only legal, legitimately obtained digital products and services.",
  "Keep inventory, stock counts, delivery time, and listing descriptions accurate.",
  "Upload delivery proof for every order before marking it delivered.",
  "Keep buyer communication and order fulfillment inside EZKEY.",
  "Do not duplicate listings, manipulate search tags, or sell outside the platform.",
  "Cooperate with dispute reviews and support requests within the required response window.",
];

const reviewStages = [
  { label: "Account and phone check", time: "Instant to 15 min" },
  { label: "Document and selfie KYC", time: "Usually 24-48 hours" },
  { label: "Payout ownership review", time: "Usually 24-48 hours" },
  { label: "Seller policy approval", time: "Manual review" },
];

export default function BecomeSellerPage() {
  return (
    <div className="bg-cyber-dark pt-24 pb-20">
      <section className="section-container">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-neon-purple/20 bg-neon-purple/10 px-4 py-1.5 text-sm text-neon-purple">
              <LockKeyhole className="h-3.5 w-3.5" />
              Seller dashboard locked until verification is approved
            </div>

            <div>
              <h1 className="font-display text-3xl font-black leading-tight sm:text-5xl">
                Become a verified EZKEY seller
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Apply to sell digital apps, vouchers, keys, accounts, credits, and digital services.
                Sellers must pass account checks, KYC, payout verification, and policy approval
                before creating listings.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a href="#seller-application" className="btn-neon text-sm !px-6 !py-3">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Start Seller Application
                  <ArrowRight className="h-4 w-4" />
                </span>
              </a>
              <Link href="/auth/sign-up" className="btn-ghost-neon text-center text-sm !px-6 !py-3">
                Create Account First
              </Link>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 border-b border-cyber-border pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neon-green/10">
                <BadgeCheck className="h-5 w-5 text-neon-green" />
              </div>
              <div>
                <h2 className="font-display text-sm font-semibold">Approval checklist</h2>
                <p className="text-xs text-muted-foreground">
                  Complete every step before selling is enabled
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {onboardingSteps.map((step, index) => (
                <div key={step.title} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyber-border bg-cyber-surface">
                      <step.icon className="h-4 w-4 text-neon-purple" />
                    </div>
                    {index < onboardingSteps.length - 1 && (
                      <div className="h-full w-px bg-cyber-border" />
                    )}
                  </div>
                  <div className="pb-4">
                    <h3 className="text-sm font-semibold">{step.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-container mt-12 grid gap-6 lg:grid-cols-3">
        <div className="glass-card p-6">
          <Smartphone className="mb-4 h-6 w-6 text-neon-blue" />
          <h2 className="font-display text-sm font-semibold">Account security</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Email, phone, and MFA checks reduce account takeover risk before seller tools are unlocked.
          </p>
        </div>
        <div className="glass-card p-6">
          <FileCheck2 className="mb-4 h-6 w-6 text-neon-green" />
          <h2 className="font-display text-sm font-semibold">KYC and KYB review</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Individual sellers verify identity. Business sellers also provide company and tax details.
          </p>
        </div>
        <div className="glass-card p-6">
          <Clock className="mb-4 h-6 w-6 text-neon-orange" />
          <h2 className="font-display text-sm font-semibold">Review before selling</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Listing access opens only after the application, payout details, and seller rules are approved.
          </p>
        </div>
      </section>

      <section id="seller-application" className="section-container mt-12">
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold">Seller Application</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Complete these seller details, then start the live Didit KYC flow for document scanning,
            liveness, and face matching. Seller tools remain locked until the verification is approved.
          </p>
        </div>

        <form id="seller-application-form" className="space-y-6">
          <div className="glass-card p-6">
            <div className="mb-5 flex items-center gap-3">
              <UserRound className="h-5 w-5 text-neon-purple" />
              <h3 className="font-display text-sm font-semibold">1. Account and contact details</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Legal full name</label>
                <input
                  name="legal_name"
                  className="input-neon"
                  placeholder="Name exactly as shown on ID"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email address</label>
                <input
                  name="email"
                  className="input-neon"
                  type="email"
                  placeholder="seller@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mobile number</label>
                <input
                  name="phone"
                  className="input-neon"
                  placeholder="+1 555 000 0000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Country / region</label>
                <input
                  name="country"
                  className="input-neon"
                  placeholder="Country where you are legally based"
                  required
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="mb-5 flex items-center gap-3">
              <Store className="h-5 w-5 text-neon-blue" />
              <h3 className="font-display text-sm font-semibold">2. Store profile</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Store name</label>
                <input
                  name="store_name"
                  className="input-neon"
                  placeholder="Public seller name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Seller type</label>
                <select name="seller_type" className="input-neon" required defaultValue="individual">
                  <option value="individual">Individual seller</option>
                  <option value="registered_business">Registered business</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">What will you sell?</label>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {["Digital apps", "Vouchers", "Digital keys", "Accounts", "Digital credits", "Digital services"].map(
                    (category) => (
                      <label
                        key={category}
                        className="flex items-center gap-2 rounded-lg border border-cyber-border bg-cyber-surface/30 px-3 py-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          name="product_categories"
                          value={category}
                          className="h-4 w-4 accent-violet-500"
                        />
                        {category}
                      </label>
                    ),
                  )}
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Delivery plan</label>
                <textarea
                  name="delivery_plan"
                  className="input-neon min-h-28 resize-none"
                  placeholder="Explain how you will deliver products, typical delivery time, and how you will provide proof."
                  required
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="mb-5 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-neon-green" />
              <h3 className="font-display text-sm font-semibold">3. Identity verification and KYC</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date of birth</label>
                <input name="date_of_birth" className="input-neon" type="date" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ID document type</label>
                <select
                  name="document_type"
                  className="input-neon"
                  required
                  defaultValue="national_id"
                >
                  <option value="national_id">NIC / National ID card</option>
                  <option value="driving_license">Driving licence</option>
                  <option value="passport">Passport</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Residential address</label>
                <input
                  name="residential_address"
                  className="input-neon"
                  placeholder="Street, city, state, postal code, country"
                />
              </div>
              <div className="rounded-xl border border-neon-blue/20 bg-neon-blue/5 p-4 md:col-span-2">
                <div className="flex gap-3">
                  <Camera className="mt-0.5 h-5 w-5 shrink-0 text-neon-blue" />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    The live KYC button creates a Didit session and opens hosted document scanning,
                    liveness, and face matching. Select NIC/national ID or driving licence here,
                    then scan the real document inside Didit. When the Didit page opens, allow
                    camera access in the browser prompt so the hosted scanner can read your ID.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="mb-5 flex items-center gap-3">
              <Building2 className="h-5 w-5 text-neon-orange" />
              <h3 className="font-display text-sm font-semibold">4. Business details, if applicable</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Registered business name</label>
                <input
                  name="business_name"
                  className="input-neon"
                  placeholder="Leave blank for individual sellers"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Registration or tax ID</label>
                <input
                  name="registration_number"
                  className="input-neon"
                  placeholder="Company number, EIN, VAT, or local equivalent"
                />
              </div>
              <p className="rounded-xl border border-neon-orange/20 bg-neon-orange/5 p-4 text-sm leading-relaxed text-muted-foreground md:col-span-2">
                Business sellers may be asked for company documents during manual review. Individual
                sellers can leave this section blank.
              </p>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="mb-5 flex items-center gap-3">
              <WalletCards className="h-5 w-5 text-neon-purple" />
              <h3 className="font-display text-sm font-semibold">5. Payout setup</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Payout method</label>
                <select
                  name="payout_method"
                  className="input-neon"
                  required
                  defaultValue="bank_transfer"
                >
                  <option value="bank_transfer">Bank transfer</option>
                  <option value="paypal">PayPal</option>
                  <option value="stripe">Stripe</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Payout country</label>
                <input
                  name="payout_country"
                  className="input-neon"
                  placeholder="Must match verified seller profile"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Account holder name</label>
                <input
                  name="account_holder_name"
                  className="input-neon"
                  placeholder="Must match legal name or verified business name"
                  required
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="mb-5 flex items-center gap-3">
              <FileText className="h-5 w-5 text-neon-green" />
              <h3 className="font-display text-sm font-semibold">6. Seller rules acknowledgement</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {sellerRules.map((rule) => (
                <label
                  key={rule}
                  className="flex items-start gap-3 rounded-lg border border-cyber-border bg-cyber-surface/30 p-3 text-sm leading-relaxed text-muted-foreground"
                >
                  <input
                    type="checkbox"
                    name="seller_rules"
                    value={rule}
                    required
                    className="mt-1 h-4 w-4 shrink-0 accent-violet-500"
                  />
                  <span>{rule}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="mb-5 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-neon-blue" />
              <h3 className="font-display text-sm font-semibold">7. Live KYC consent</h3>
            </div>
            <label className="flex items-start gap-3 rounded-lg border border-neon-blue/20 bg-neon-blue/5 p-4 text-sm leading-relaxed text-muted-foreground">
              <input
                type="checkbox"
                name="kyc_consent"
                value="yes"
                required
                className="mt-1 h-4 w-4 shrink-0 accent-cyan-500"
              />
              <span>
                I consent to EZKEY sending my seller application details to Didit for live
                document scanning, liveness, face match, and KYC checks. I understand seller
                access opens only after an approved verification result is recorded.
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-neon-purple/20 bg-neon-purple/5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-sm font-semibold">Ready for live KYC?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                This creates a Didit session for NIC/national ID, driving licence, or passport
                checks with face liveness. Seller tools stay locked until approval.
              </p>
            </div>
            <DiditKycButton formId="seller-application-form" />
          </div>
        </form>
      </section>

      <section className="section-container mt-12 grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <div className="mb-5 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-neon-green" />
            <h2 className="font-display text-sm font-semibold">Documents to prepare</h2>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {requiredDocuments.map((document) => (
              <li key={document} className="flex gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-neon-green" />
                <span>{document}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card p-6">
          <div className="mb-5 flex items-center gap-3">
            <Mail className="h-5 w-5 text-neon-blue" />
            <h2 className="font-display text-sm font-semibold">Review timeline</h2>
          </div>
          <div className="space-y-3">
            {reviewStages.map((stage) => (
              <div
                key={stage.label}
                className="flex items-center justify-between gap-4 rounded-lg border border-cyber-border bg-cyber-surface/30 px-4 py-3"
              >
                <span className="text-sm">{stage.label}</span>
                <span className="text-xs text-muted-foreground">{stage.time}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex gap-3 rounded-xl border border-neon-orange/20 bg-neon-orange/5 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-neon-orange" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Applications with mismatched names, unclear documents, unsupported payout countries,
              or restricted products should remain pending until manual review is complete.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
