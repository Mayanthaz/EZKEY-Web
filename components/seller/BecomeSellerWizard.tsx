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
  "Digital keys",
  "Digital apps",
  "Vouchers",
  "Accounts",
  "Digital credits",
  "Digital services",
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
      toast.success("All seller policies acknowledged!");
    }
  };

  // Step Validation
  const validateStep1 = () => {
    if (!legalName.trim()) {
      toast.error("Please enter your legal full name as shown on your ID.");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid business/seller email address.");
      return false;
    }
    if (!country.trim()) {
      toast.error("Please specify your country or region.");
      return false;
    }
    if (!storeName.trim()) {
      toast.error("Please enter your public store name.");
      return false;
    }
    if (selectedCategories.length === 0) {
      toast.error("Please select at least one product category you plan to sell.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!dateOfBirth) {
      toast.error("Please enter your date of birth.");
      return false;
    }
    if (!deliveryPlan.trim()) {
      toast.error("Please explain your product delivery plan.");
      return false;
    }
    return true;
  };

  const goToNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 400, behavior: "smooth" });
    } else if (currentStep === 2 && validateStep2()) {
      // Auto-fill account holder name and payout country if blank
      if (!accountHolderName) setAccountHolderName(legalName);
      if (!payoutCountry) setPayoutCountry(country);
      setCurrentStep(3);
      window.scrollTo({ top: 400, behavior: "smooth" });
    }
  };

  const progressPercent = currentStep === 1 ? 33 : currentStep === 2 ? 66 : 100;

  return (
    <div className="glass-card overflow-hidden border border-cyber-border shadow-2xl">
      {/* Stepper Progress Bar */}
      <div className="p-6 border-b border-cyber-border bg-white/[0.01]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-neon-purple text-white font-bold">
                Step {currentStep} of 3
              </Badge>
              <span className="text-xs text-muted-foreground">
                {currentStep === 1 && "Identity & Store Branding"}
                {currentStep === 2 && "Verification & Delivery Strategy"}
                {currentStep === 3 && "Payout Setup & Compliance Agreement"}
              </span>
            </div>
            <h2 className="font-display text-xl font-bold mt-1.5">
              {currentStep === 1 && "1. Account & Store Profile"}
              {currentStep === 2 && "2. Verification Documents & Fulfilment"}
              {currentStep === 3 && "3. Payout Destination & Final KYC Consent"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3].map((stepNum) => (
              <button
                key={stepNum}
                type="button"
                onClick={() => {
                  if (stepNum < currentStep) setCurrentStep(stepNum);
                  else if (stepNum === 2 && validateStep1()) setCurrentStep(2);
                  else if (stepNum === 3 && validateStep1() && validateStep2())
                    setCurrentStep(3);
                }}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                  stepNum === currentStep
                    ? "bg-neon-purple text-white shadow-lg shadow-neon-purple/20 border border-neon-purple"
                    : stepNum < currentStep
                    ? "bg-neon-green/20 text-neon-green border border-neon-green/30"
                    : "bg-white/[0.04] text-muted-foreground border border-cyber-border"
                }`}
              >
                {stepNum < currentStep ? (
                  <CheckCircle2 className="w-4 h-4 text-neon-green" />
                ) : (
                  stepNum
                )}
              </button>
            ))}
          </div>
        </div>

        <Progress value={progressPercent} className="h-1.5 bg-cyber-surface" />
      </div>

      {/* Main Form container holding standard inputs with exact names for DiditKycButton */}
      <form id="seller-application-form" className="p-6 sm:p-8 space-y-6">
        {/* STEP 1: Personal & Store Profile */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Legal Full Name <span className="text-red-400">*</span>
                </label>
                <Input
                  name="legal_name"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="e.g. Alexander John Doe"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Must match the name shown on your government identity card.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Seller Contact Email <span className="text-red-400">*</span>
                </label>
                <Input
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seller@yourdomain.com"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  We will deliver order alerts and payout notices to this inbox.
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
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Country / Operating Jurisdiction <span className="text-red-400">*</span>
                </label>
                <Input
                  name="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. United States, United Kingdom, Germany"
                  required
                />
              </div>
            </div>

            <div className="border-t border-cyber-border/40 pt-5 grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Public Store / Vendor Name <span className="text-red-400">*</span>
                </label>
                <Input
                  name="store_name"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Apex Digital Vault"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Seller Account Classification
                </label>
                <Select value={sellerType} onValueChange={setSellerType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual Private Seller</SelectItem>
                    <SelectItem value="registered_business">
                      Registered Corporate Entity / Business
                    </SelectItem>
                  </SelectContent>
                </Select>
                {/* Hidden input to guarantee form field presence */}
                <input type="hidden" name="seller_type" value={sellerType} />
              </div>
            </div>

            {/* Product Category Chips */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-foreground">
                What products do you intend to list?{" "}
                <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {CATEGORIES.map((cat) => {
                  const isChecked = selectedCategories.includes(cat);
                  return (
                    <label
                      key={cat}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-all select-none ${
                        isChecked
                          ? "bg-neon-purple/15 text-neon-purple border-neon-purple/50 shadow-sm"
                          : "bg-white/[0.02] text-muted-foreground border-cyber-border hover:border-white/20"
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="product_categories"
                        value={cat}
                        checked={isChecked}
                        onChange={() => toggleCategory(cat)}
                        className="hidden"
                      />
                      {isChecked ? (
                        <Check className="w-3.5 h-3.5 text-neon-purple" />
                      ) : null}
                      {cat}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="button"
                onClick={goToNextStep}
                className="bg-neon-purple text-white hover:bg-neon-purple/90 font-semibold px-6"
              >
                Continue to Step 2
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Verification & Delivery Strategy */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Date of Birth <span className="text-red-400">*</span>
                </label>
                <Input
                  name="date_of_birth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Must be at least 18 years old to operate a seller store.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Primary Identity Document Type <span className="text-red-400">*</span>
                </label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ID document" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national_id">
                      National Identity Card (NIC / ID)
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
                  Residential / Business Address
                </label>
                <Input
                  name="residential_address"
                  value={residentialAddress}
                  onChange={(e) => setResidentialAddress(e.target.value)}
                  placeholder="Street address, City, Postal Code, Country"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">
                  Fulfillment & Delivery Plan <span className="text-red-400">*</span>
                </label>
                <Textarea
                  name="delivery_plan"
                  rows={3}
                  value={deliveryPlan}
                  onChange={(e) => setDeliveryPlan(e.target.value)}
                  placeholder="Describe how keys or digital assets will be sourced, stocked, and delivered to buyers."
                  required
                />
              </div>
            </div>

            {/* Optional Business Details */}
            {sellerType === "registered_business" && (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-cyber-border space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-neon-blue">
                  <Building2 className="w-4 h-4" />
                  Corporate Business Information
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Company Name</label>
                    <Input
                      name="business_name"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Apex Digital LLC"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">
                      Registration or Tax ID
                    </label>
                    <Input
                      name="registration_number"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="e.g. EIN / VAT / Commercial Registration"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-neon-blue/5 border border-neon-blue/20 flex items-start gap-3 text-xs">
              <Camera className="w-5 h-5 text-neon-blue shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">
                  Live Camera KYC Check
                </p>
                <p className="text-muted-foreground mt-0.5 leading-relaxed">
                  The Didit hosted biometric scan requires a working camera on your desktop or phone to confirm liveness and match your face with the submitted government document.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous Step
              </Button>
              <Button
                type="button"
                onClick={goToNextStep}
                className="bg-neon-purple text-white hover:bg-neon-purple/90 font-semibold px-6"
              >
                Continue to Step 3
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Payout Setup & Rules Agreement */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Payout Method <span className="text-red-400">*</span>
                </label>
                <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payout method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Direct Bank Transfer</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" name="payout_method" value={payoutMethod} />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Payout Country <span className="text-red-400">*</span>
                </label>
                <Input
                  name="payout_country"
                  value={payoutCountry}
                  onChange={(e) => setPayoutCountry(e.target.value)}
                  placeholder="e.g. United States"
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">
                  Account Holder Full Legal Name <span className="text-red-400">*</span>
                </label>
                <Input
                  name="account_holder_name"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="Must match your legal name or registered business"
                  required
                />
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
                    : "Accept All 6 Rules"}
                </button>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {SELLER_RULES.map((rule, idx) => {
                  const isChecked = acceptedRules.includes(rule);
                  return (
                    <label
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all select-none ${
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
                      <span className="leading-relaxed">{rule}</span>
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
                required
                className="mt-0.5 rounded border-cyber-border text-neon-blue focus:ring-neon-blue shrink-0"
              />
              <span className="leading-relaxed">
                I hereby consent to EZKEY transmitting my seller verification application to Didit for biometric liveness matching, document authentication, and anti-fraud analysis. I acknowledge seller privileges unlock upon approved verification.
              </span>
            </label>

            {/* Final CTA Action Banner */}
            <div className="p-5 rounded-2xl border border-neon-purple/20 bg-gradient-to-r from-neon-purple/10 via-neon-purple/5 to-transparent flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="font-display text-sm font-bold text-foreground">
                  Application Ready for Submission
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-md">
                  Clicking below initializes your secure Didit hosted verification session.
                </p>
              </div>

              <DiditKycButton formId="seller-application-form" />
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(2)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous Step
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
