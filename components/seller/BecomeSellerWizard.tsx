"use client";

import { useState } from "react";
import {
  UserRound,
  Store,
  ShieldCheck,
  WalletCards,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Camera,
  Building2,
  Sparkles,
  FileCheck2,
  Check,
  RotateCcw,
  Mail,
  Globe,
  Calendar,
  CreditCard,
  Layers,
  HelpCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DiditKycButton } from "@/components/seller/DiditKycButton";
import { toast } from "sonner";

const CATEGORIES = [
  { id: "Digital keys", label: "Digital keys", icon: "🔑", desc: "Steam, Epic, Xbox, PSN codes" },
  { id: "Digital apps", label: "Digital apps", icon: "📱", desc: "Software, utilities & tools" },
  { id: "Vouchers", label: "Vouchers", icon: "🎟️", desc: "Gift cards, balance codes" },
  { id: "Accounts", label: "Accounts", icon: "👤", desc: "Gaming & streaming accounts" },
  { id: "Digital credits", label: "Digital credits", icon: "💳", desc: "In-game coins & wallet topups" },
  { id: "Digital services", label: "Digital services", icon: "🚀", desc: "Activation, boosting, setup" },
];

const SELLER_RULES = [
  "Sell only legal, legitimately obtained digital products and services.",
  "Keep inventory, stock counts, delivery time, and listing descriptions accurate.",
  "Upload delivery proof for every order before marking it delivered.",
  "Keep buyer communication and order fulfillment inside EZKEY.",
  "Do not duplicate listings, manipulate search tags, or sell outside the platform.",
  "Cooperate with dispute reviews and support requests within the required response window.",
];

export function BecomeSellerWizard() {
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [legalName, setLegalName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [storeName, setStoreName] = useState("");
  const [sellerType, setSellerType] = useState("individual");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Digital keys",
  ]);

  const [dateOfBirth, setDateOfBirth] = useState("");
  const [documentType, setDocumentType] = useState("national_id");
  const [residentialAddress, setResidentialAddress] = useState("");
  const [deliveryPlan, setDeliveryPlan] = useState(
    "Instant automated key delivery from pre-uploaded inventory vault, with manual customer support."
  );
  const [businessName, setBusinessName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");

  const [payoutMethod, setPayoutMethod] = useState("bank_transfer");
  const [payoutCountry, setPayoutCountry] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [acceptedRules, setAcceptedRules] = useState<string[]>([]);
  const [kycConsent, setKycConsent] = useState(false);

  // Auto-Fill sample data for quick testing and streamlined UX
  const handleAutoFill = () => {
    setLegalName("Alexander James Vance");
    setEmail("alex.vance@apexvault.io");
    setPhone("+1 (415) 890-3421");
    setCountry("United States");
    setStoreName("Apex Key Vault");
    setSellerType("individual");
    setSelectedCategories(["Digital keys", "Digital apps", "Vouchers"]);
    setDateOfBirth("1995-04-18");
    setDocumentType("national_id");
    setResidentialAddress("742 Evergreen Terrace, San Francisco, CA 94107, USA");
    setDeliveryPlan(
      "Automated 24/7 digital key delivery using EZKEY Instant Vault API with encrypted key codes and 15-minute SLA ticket support."
    );
    setPayoutMethod("bank_transfer");
    setPayoutCountry("United States");
    setAccountHolderName("Alexander James Vance");
    setAcceptedRules([...SELLER_RULES]);
    setKycConsent(true);

    toast.success("Sample application filled with valid merchant data!", {
      description: "You can review or edit any fields, then proceed through all steps.",
    });
  };

  const handleReset = () => {
    setLegalName("");
    setEmail("");
    setPhone("");
    setCountry("");
    setStoreName("");
    setSellerType("individual");
    setSelectedCategories(["Digital keys"]);
    setDateOfBirth("");
    setDocumentType("national_id");
    setResidentialAddress("");
    setDeliveryPlan("");
    setBusinessName("");
    setRegistrationNumber("");
    setPayoutMethod("bank_transfer");
    setPayoutCountry("");
    setAccountHolderName("");
    setAcceptedRules([]);
    setKycConsent(false);
    setCurrentStep(1);
    toast.info("Application form reset.");
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleRule = (rule: string) => {
    setAcceptedRules((prev) =>
      prev.includes(rule) ? prev.filter((r) => r !== rule) : [...prev, rule]
    );
  };

  const handleSelectAllRules = () => {
    if (acceptedRules.length === SELLER_RULES.length) {
      setAcceptedRules([]);
    } else {
      setAcceptedRules([...SELLER_RULES]);
      toast.success("All 6 seller policies accepted!");
    }
  };

  // Completion calculations
  const step1Valid =
    legalName.trim().length > 0 &&
    email.trim().includes("@") &&
    country.trim().length > 0 &&
    storeName.trim().length > 0 &&
    selectedCategories.length > 0;

  const step2Valid =
    dateOfBirth.trim().length > 0 &&
    deliveryPlan.trim().length > 0;

  const step3Valid =
    payoutCountry.trim().length > 0 &&
    accountHolderName.trim().length > 0 &&
    acceptedRules.length === SELLER_RULES.length &&
    kycConsent;

  const totalRequiredFields = 9;
  const completedFieldsCount = [
    legalName.trim().length > 0,
    email.trim().includes("@"),
    country.trim().length > 0,
    storeName.trim().length > 0,
    selectedCategories.length > 0,
    dateOfBirth.trim().length > 0,
    deliveryPlan.trim().length > 0,
    payoutCountry.trim().length > 0,
    accountHolderName.trim().length > 0,
  ].filter(Boolean).length;

  const progressPercent = Math.round((completedFieldsCount / totalRequiredFields) * 100);

  // Navigation handlers with validations
  const goToNextStep = () => {
    if (currentStep === 1) {
      if (!legalName.trim()) {
        toast.error("Please enter your legal full name.");
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        toast.error("Please enter a valid seller email.");
        return;
      }
      if (!country.trim()) {
        toast.error("Please specify your country or jurisdiction.");
        return;
      }
      if (!storeName.trim()) {
        toast.error("Please enter your public store name.");
        return;
      }
      if (selectedCategories.length === 0) {
        toast.error("Please select at least one product category.");
        return;
      }
      setCurrentStep(2);
      window.scrollTo({ top: 320, behavior: "smooth" });
    } else if (currentStep === 2) {
      if (!dateOfBirth) {
        toast.error("Please enter your date of birth.");
        return;
      }
      if (!deliveryPlan.trim()) {
        toast.error("Please provide your delivery fulfillment plan.");
        return;
      }
      if (!accountHolderName) setAccountHolderName(legalName);
      if (!payoutCountry) setPayoutCountry(country);
      setCurrentStep(3);
      window.scrollTo({ top: 320, behavior: "smooth" });
    }
  };

  return (
    <div className="glass-card overflow-hidden border border-cyber-border shadow-2xl rounded-2xl">
      {/* Top Application Toolbar */}
      <div className="p-6 border-b border-cyber-border bg-cyber-dark/80 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-neon-green animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-neon-green">
                Merchant Verification Portal
              </span>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-xs text-muted-foreground">
                Step {currentStep} of 3
              </span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold mt-1 text-foreground">
              {currentStep === 1 && "1. Account & Store Identity"}
              {currentStep === 2 && "2. Verification Documents & Fulfilment"}
              {currentStep === 3 && "3. Payout Destination & Review"}
            </h2>
          </div>

          {/* Quick Action Buttons: Auto-fill Demo Data & Reset */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handleAutoFill}
              variant="outline"
              size="sm"
              className="border-neon-purple/50 bg-neon-purple/10 hover:bg-neon-purple/20 text-neon-purple font-semibold text-xs h-9 px-3.5 transition-all shadow-sm shadow-neon-purple/10"
              title="Populate with verified sample seller information for quick testing"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-neon-purple" />
              ⚡ Auto-Fill Demo
            </Button>
            <Button
              type="button"
              onClick={handleReset}
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground h-9 px-2.5"
              title="Clear all fields"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Stepper Navigation Tabs */}
        <div className="grid grid-cols-3 gap-2 mt-6">
          {[
            {
              num: 1,
              title: "Store Profile",
              desc: "Name & categories",
              isComplete: step1Valid,
              icon: Store,
            },
            {
              num: 2,
              title: "Documents",
              desc: "ID & delivery",
              isComplete: step2Valid,
              icon: ShieldCheck,
            },
            {
              num: 3,
              title: "Payout & Review",
              desc: "Bank & KYC start",
              isComplete: step3Valid,
              icon: WalletCards,
            },
          ].map((step) => {
            const isActive = step.num === currentStep;
            const Icon = step.icon;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => {
                  if (step.num === 1) setCurrentStep(1);
                  if (step.num === 2) {
                    if (step1Valid) setCurrentStep(2);
                    else goToNextStep();
                  }
                  if (step.num === 3) {
                    if (step1Valid && step2Valid) {
                      if (!accountHolderName) setAccountHolderName(legalName);
                      if (!payoutCountry) setPayoutCountry(country);
                      setCurrentStep(3);
                    } else if (!step1Valid) {
                      setCurrentStep(1);
                      toast.error("Please complete Step 1 first.");
                    } else {
                      setCurrentStep(2);
                      toast.error("Please complete Step 2 first.");
                    }
                  }
                }}
                className={`relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? "bg-neon-purple/15 border-neon-purple shadow-md shadow-neon-purple/10"
                    : step.isComplete
                    ? "bg-neon-green/10 border-neon-green/30 hover:border-neon-green/60"
                    : "bg-white/[0.02] border-cyber-border hover:border-white/20"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    isActive
                      ? "bg-neon-purple text-white shadow"
                      : step.isComplete
                      ? "bg-neon-green text-black"
                      : "bg-cyber-surface border border-cyber-border text-muted-foreground"
                  }`}
                >
                  {step.isComplete ? <Check className="w-4 h-4 stroke-[3]" /> : step.num}
                </div>
                <div className="hidden sm:block min-w-0">
                  <div className="text-xs font-bold truncate text-foreground flex items-center gap-1.5">
                    {step.title}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {step.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Field Completion Progress Bar */}
        <div className="mt-4 pt-3 border-t border-cyber-border/40 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Form Completion:</span>
            <span className="font-semibold text-foreground">{progressPercent}%</span>
            <span className="text-[11px]">({completedFieldsCount}/{totalRequiredFields} core fields)</span>
          </div>
          {progressPercent === 100 && (
            <Badge className="bg-neon-green/20 text-neon-green border-neon-green/40 text-[10px] py-0 px-2">
              Ready to submit
            </Badge>
          )}
        </div>
        <Progress value={progressPercent} className="h-1 mt-2 bg-cyber-surface" />
      </div>

      {/* Main Form container holding standard inputs with exact names for DiditKycButton */}
      {/* CRITICAL: We keep ALL steps in the DOM (toggling display classes) so new FormData captures all fields at submission! */}
      <form id="seller-application-form" className="p-6 sm:p-8">
        {/* STEP 1: Personal & Store Profile */}
        <div className={currentStep === 1 ? "space-y-6 animate-in fade-in duration-300" : "hidden"}>
          <div className="p-4 rounded-xl border border-neon-purple/20 bg-neon-purple/5 flex items-start gap-3">
            <UserRound className="w-5 h-5 text-neon-purple shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-foreground">Personal Identity & Public Store Identity</p>
              <p className="text-muted-foreground mt-0.5 leading-relaxed">
                Provide your legal identity as documented on government identification. Your public store name will be displayed to buyers on listings.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Legal Full Name <span className="text-red-400">*</span></span>
                {legalName.trim().length > 0 && (
                  <span className="text-[10px] text-neon-green flex items-center gap-1">
                    <Check className="w-3 h-3" /> Valid
                  </span>
                )}
              </label>
              <Input
                name="legal_name"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="e.g. Alexander John Doe"
                className="bg-cyber-surface/60 border-cyber-border focus:border-neon-purple"
              />
              <p className="text-[11px] text-muted-foreground">
                Must match the name shown on your government identity card.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Seller Contact Email <span className="text-red-400">*</span></span>
                {email.includes("@") && (
                  <span className="text-[10px] text-neon-green flex items-center gap-1">
                    <Check className="w-3 h-3" /> Valid
                  </span>
                )}
              </label>
              <Input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seller@yourdomain.com"
                className="bg-cyber-surface/60 border-cyber-border focus:border-neon-purple"
              />
              <p className="text-[11px] text-muted-foreground">
                Order alerts, key delivery notices, and payout confirmations arrive here.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Mobile Phone Number
              </label>
              <Input
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 234-5678"
                className="bg-cyber-surface/60 border-cyber-border focus:border-neon-purple"
              />
              <p className="text-[11px] text-muted-foreground">
                Used for urgent order notifications and KYC SMS verification.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Country / Jurisdiction <span className="text-red-400">*</span></span>
                {country.trim().length > 0 && (
                  <span className="text-[10px] text-neon-green flex items-center gap-1">
                    <Check className="w-3 h-3" /> Valid
                  </span>
                )}
              </label>
              <Input
                name="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. United States, Germany, United Kingdom"
                className="bg-cyber-surface/60 border-cyber-border focus:border-neon-purple"
              />
            </div>
          </div>

          <div className="border-t border-cyber-border/40 pt-5 grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Public Store / Vendor Name <span className="text-red-400">*</span></span>
                {storeName.trim().length > 0 && (
                  <span className="text-[10px] text-neon-green flex items-center gap-1">
                    <Check className="w-3 h-3" /> Set
                  </span>
                )}
              </label>
              <Input
                name="store_name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Apex Digital Vault"
                className="bg-cyber-surface/60 border-cyber-border focus:border-neon-purple"
              />
              <p className="text-[11px] text-muted-foreground">
                This public brand name appears on your listings and seller profile.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Seller Account Classification
              </label>
              <Select value={sellerType} onValueChange={setSellerType}>
                <SelectTrigger className="bg-cyber-surface/60 border-cyber-border">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual Private Merchant</SelectItem>
                  <SelectItem value="registered_business">
                    Registered Corporate Entity / LLC
                  </SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="seller_type" value={sellerType} />
            </div>
          </div>

          {/* Product Category Selection */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                What products do you intend to list? <span className="text-red-400">*</span>
              </label>
              <span className="text-xs text-muted-foreground">
                {selectedCategories.length} selected
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CATEGORIES.map((cat) => {
                const isChecked = selectedCategories.includes(cat.id);
                return (
                  <label
                    key={cat.id}
                    className={`relative flex flex-col p-3 rounded-xl border text-xs cursor-pointer transition-all select-none ${
                      isChecked
                        ? "bg-neon-purple/15 text-foreground border-neon-purple shadow-sm"
                        : "bg-white/[0.02] text-muted-foreground border-cyber-border hover:border-white/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="product_categories"
                      value={cat.id}
                      checked={isChecked}
                      onChange={() => toggleCategory(cat.id)}
                      className="hidden"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-base">{cat.icon}</span>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] ${
                          isChecked
                            ? "bg-neon-purple border-neon-purple text-white"
                            : "border-cyber-border bg-cyber-surface"
                        }`}
                      >
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                    <span className="font-bold text-foreground mt-2">{cat.label}</span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                      {cat.desc}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="button"
              onClick={goToNextStep}
              className="bg-neon-purple text-white hover:bg-neon-purple/90 font-semibold px-6 shadow-lg shadow-neon-purple/20"
            >
              Continue to Step 2
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* STEP 2: Verification Documents & Fulfilment */}
        <div className={currentStep === 2 ? "space-y-6 animate-in fade-in duration-300" : "hidden"}>
          <div className="p-4 rounded-xl border border-neon-blue/20 bg-neon-blue/5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-neon-blue shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-foreground">KYC Identity Documents & Sourcing Strategy</p>
              <p className="text-muted-foreground mt-0.5 leading-relaxed">
                Prepare your identity document for automated verification via Didit biometric scan. Specify your digital fulfillment process.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Date of Birth <span className="text-red-400">*</span></span>
                {dateOfBirth.length > 0 && (
                  <span className="text-[10px] text-neon-green flex items-center gap-1">
                    <Check className="w-3 h-3" /> Valid
                  </span>
                )}
              </label>
              <Input
                name="date_of_birth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="bg-cyber-surface/60 border-cyber-border focus:border-neon-purple"
              />
              <p className="text-[11px] text-muted-foreground">
                Merchants must be 18+ years of age to contractually trade on EZKEY.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Primary Identity Document Type <span className="text-red-400">*</span>
              </label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger className="bg-cyber-surface/60 border-cyber-border">
                  <SelectValue placeholder="Select ID document" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="national_id">
                    National Identity Card (NIC / ID Card)
                  </SelectItem>
                  <SelectItem value="driving_license">
                    Driver&apos;s License
                  </SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="document_type" value={documentType} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-semibold text-foreground">
                Residential / Operating Business Address
              </label>
              <Input
                name="residential_address"
                value={residentialAddress}
                onChange={(e) => setResidentialAddress(e.target.value)}
                placeholder="Street address, City, Postal Code, Country"
                className="bg-cyber-surface/60 border-cyber-border focus:border-neon-purple"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Fulfillment & Delivery Plan <span className="text-red-400">*</span></span>
                {deliveryPlan.trim().length > 0 && (
                  <span className="text-[10px] text-neon-green flex items-center gap-1">
                    <Check className="w-3 h-3" /> Outlined
                  </span>
                )}
              </label>
              <Textarea
                name="delivery_plan"
                rows={3}
                value={deliveryPlan}
                onChange={(e) => setDeliveryPlan(e.target.value)}
                placeholder="Describe how keys or digital assets will be sourced, stocked, and delivered to buyers."
                className="bg-cyber-surface/60 border-cyber-border focus:border-neon-purple"
              />
              <p className="text-[11px] text-muted-foreground">
                Mention if you will use EZKEY&apos;s automated key inventory vault or manual order delivery.
              </p>
            </div>
          </div>

          {/* Optional Business Details */}
          {sellerType === "registered_business" && (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-cyber-border space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-neon-blue">
                <Building2 className="w-4 h-4" />
                Corporate Entity Details
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Registered Company Name</label>
                  <Input
                    name="business_name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Apex Digital LLC"
                    className="bg-cyber-surface/60 border-cyber-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">
                    Registration or Tax Identification
                  </label>
                  <Input
                    name="registration_number"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="e.g. EIN / VAT / Company Registration Number"
                    className="bg-cyber-surface/60 border-cyber-border"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl bg-neon-blue/5 border border-neon-blue/20 flex items-start gap-3 text-xs">
            <Camera className="w-5 h-5 text-neon-blue shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">
                Biometric Webcam or Smartphone Match
              </p>
              <p className="text-muted-foreground mt-0.5 leading-relaxed">
                In Step 3, you will launch the Didit verification session. Ensure you have your physical identity document on hand with adequate lighting.
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="border-cyber-border"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous Step
            </Button>
            <Button
              type="button"
              onClick={goToNextStep}
              className="bg-neon-purple text-white hover:bg-neon-purple/90 font-semibold px-6 shadow-lg shadow-neon-purple/20"
            >
              Continue to Step 3
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* STEP 3: Payout Setup, Review & Agreement */}
        <div className={currentStep === 3 ? "space-y-6 animate-in fade-in duration-300" : "hidden"}>
          <div className="p-4 rounded-xl border border-neon-green/20 bg-neon-green/5 flex items-start gap-3">
            <WalletCards className="w-5 h-5 text-neon-green shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-foreground">Payout Destination, Application Review & Submission</p>
              <p className="text-muted-foreground mt-0.5 leading-relaxed">
                Connect your preferred payout rail. Escrow proceeds will be transferred to this account. Review your application summary before launching KYC.
              </p>
            </div>
          </div>

          {/* Payout Details */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Preferred Payout Rail <span className="text-red-400">*</span>
              </label>
              <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                <SelectTrigger className="bg-cyber-surface/60 border-cyber-border">
                  <SelectValue placeholder="Select payout method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Direct Bank Wire / ACH</SelectItem>
                  <SelectItem value="paypal">PayPal Merchant Account</SelectItem>
                  <SelectItem value="stripe">Stripe Connect Transfer</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="payout_method" value={payoutMethod} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Payout Jurisdiction / Country <span className="text-red-400">*</span></span>
                {payoutCountry.trim().length > 0 && (
                  <span className="text-[10px] text-neon-green flex items-center gap-1">
                    <Check className="w-3 h-3" /> Valid
                  </span>
                )}
              </label>
              <Input
                name="payout_country"
                value={payoutCountry}
                onChange={(e) => setPayoutCountry(e.target.value)}
                placeholder="e.g. United States"
                className="bg-cyber-surface/60 border-cyber-border focus:border-neon-purple"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Account Holder Legal Name <span className="text-red-400">*</span></span>
                {accountHolderName.trim().length > 0 && (
                  <span className="text-[10px] text-neon-green flex items-center gap-1">
                    <Check className="w-3 h-3" /> Valid
                  </span>
                )}
              </label>
              <Input
                name="account_holder_name"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="Must match your legal identity or verified business"
                className="bg-cyber-surface/60 border-cyber-border focus:border-neon-purple"
              />
              <p className="text-[11px] text-muted-foreground">
                Payout destination names that mismatch verified KYC details will be flagged by compliance.
              </p>
            </div>
          </div>

          {/* APPLICATION SUMMARY & REVIEW CARD */}
          <div className="p-5 rounded-xl border border-cyber-border bg-white/[0.02] space-y-4">
            <div className="flex items-center justify-between border-b border-cyber-border/60 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-neon-purple" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Application Summary Preview
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs text-neon-purple hover:underline"
              >
                Edit Details
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="p-2.5 rounded-lg bg-cyber-surface/40 border border-cyber-border/40">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide block">
                  Public Store Name
                </span>
                <span className="font-semibold text-foreground">
                  {storeName || <em className="text-muted-foreground/60">Not set yet</em>}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  Type: {sellerType === "registered_business" ? "Corporate Entity" : "Individual Merchant"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-cyber-surface/40 border border-cyber-border/40">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide block">
                  Applicant Legal Identity
                </span>
                <span className="font-semibold text-foreground">
                  {legalName || <em className="text-muted-foreground/60">Not set yet</em>}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  {email || "No email"} • {country || "No country"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-cyber-surface/40 border border-cyber-border/40">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide block">
                  Listing Categories
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedCategories.length > 0 ? (
                    selectedCategories.map((c) => (
                      <Badge key={c} variant="outline" className="text-[10px] py-0 px-1.5 border-neon-purple/40">
                        {c}
                      </Badge>
                    ))
                  ) : (
                    <em className="text-muted-foreground/60">None selected</em>
                  )}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-cyber-surface/40 border border-cyber-border/40">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide block">
                  Payout Rail & Holder
                </span>
                <span className="font-semibold text-foreground capitalize">
                  {payoutMethod.replace("_", " ")} ({payoutCountry || "Country"})
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5 truncate">
                  Holder: {accountHolderName || legalName || "Not set"}
                </span>
              </div>
            </div>
          </div>

          {/* Seller Rules Agreement */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-neon-green" />
                Platform Seller Rules & Code of Conduct
              </label>
              <button
                type="button"
                onClick={handleSelectAllRules}
                className="text-xs text-neon-purple hover:underline font-medium"
              >
                {acceptedRules.length === SELLER_RULES.length
                  ? "Deselect All"
                  : "Accept All 6 Policies"}
              </button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {SELLER_RULES.map((rule, idx) => {
                const isChecked = acceptedRules.includes(rule);
                return (
                  <label
                    key={idx}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all select-none ${
                      isChecked
                        ? "bg-neon-green/5 border-neon-green/30 text-foreground"
                        : "bg-white/[0.01] border-cyber-border text-muted-foreground hover:border-white/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="seller_rules"
                      value={rule}
                      checked={isChecked}
                      onChange={() => toggleRule(rule)}
                      className="mt-0.5 rounded border-cyber-border text-neon-purple focus:ring-neon-purple shrink-0"
                    />
                    <span className="leading-relaxed text-[11px]">{rule}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* KYC Consent Checkbox */}
          <label className="flex items-start gap-3 p-4 rounded-xl border border-neon-blue/20 bg-neon-blue/5 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              name="kyc_consent"
              value="yes"
              checked={kycConsent}
              onChange={(e) => setKycConsent(e.target.checked)}
              className="mt-0.5 rounded border-cyber-border text-neon-blue focus:ring-neon-blue shrink-0"
            />
            <span className="leading-relaxed">
              I consent to EZKEY transmitting my seller verification application to Didit for biometric face matching, identity document authentication, and fraud checks. I agree to operate in accordance with EZKEY merchant terms.
            </span>
          </label>

          {/* Final Submission Card with Didit Button */}
          <div className="p-6 rounded-2xl border border-neon-purple/30 bg-gradient-to-r from-neon-purple/15 via-cyber-surface/60 to-transparent flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-neon-green/20 text-neon-green border-neon-green/40 text-[10px]">
                  All Steps Ready
                </Badge>
                <span className="text-xs font-semibold text-foreground">
                  Launch Verification
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 max-w-md leading-relaxed">
                Submitting starts your secure, camera-enabled Didit identity verification session. Once approved, your Seller Dashboard and key inventory vaults unlock immediately.
              </p>
            </div>

            <DiditKycButton formId="seller-application-form" />
          </div>

          <div className="flex justify-between items-center pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(2)}
              className="border-cyber-border"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous Step
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
