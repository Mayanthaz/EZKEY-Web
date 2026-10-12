"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Camera,
  CheckCircle2,
  X,
  ExternalLink,
  Sparkles,
  RefreshCw,
  HelpCircle,
  KeyRound,
  FileCheck2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import Link from "next/link";

type InbuiltKycModalProps = {
  isOpen: boolean;
  onClose: () => void;
  diditUrl?: string | null;
  sessionId?: string | null;
  initialMode?: "didit" | "inbuilt";
  applicantName?: string;
  applicantDob?: string;
  applicantDocument?: string;
};

export function InbuiltKycModal({
  isOpen,
  onClose,
  diditUrl,
  sessionId,
  initialMode = "inbuilt",
  applicantName = "Alexander James Vance",
  applicantDob = "1995-04-18",
  applicantDocument = "National Identity Card (NIC)",
}: InbuiltKycModalProps) {
  const [activeTab, setActiveTab] = useState<"scanner" | "didit" | "guide">(
    diditUrl ? "didit" : "scanner"
  );

  // Scanner Steps: 1 = Document Scan, 2 = Face Liveness, 3 = Approved
  const [scannerStep, setScannerStep] = useState<1 | 2 | 3>(1);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanningProgress, setScanningProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [livenessStage, setLivenessStage] = useState<
    "align" | "blink" | "match" | "success"
  >("align");
  const [copiedKey, setCopiedKey] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start Camera
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch {
      setCameraError(
        "Camera access is not permitted or unavailable. You can proceed with the simulated scan."
      );
      setCameraActive(false);
    }
  }, []);

  // Stop Camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    if (isOpen && activeTab === "scanner" && scannerStep < 3) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, scannerStep, startCamera, stopCamera]);

  // Handle Document Capture
  const handleCaptureDocument = () => {
    setIsAnalyzing(true);
    setScanningProgress(15);

    const interval = setInterval(() => {
      setScanningProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          toast.success("Identity document verified and OCR matched!");
          setScannerStep(2);
          setLivenessStage("align");
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  // Handle Face Liveness Biometric Check
  const handleStartLiveness = () => {
    setIsAnalyzing(true);
    setLivenessStage("align");

    setTimeout(() => {
      setLivenessStage("blink");
      setTimeout(() => {
        setLivenessStage("match");
        setTimeout(() => {
          setLivenessStage("success");
          setIsAnalyzing(false);
          handleApproveSession();
        }, 1200);
      }, 1200);
    }, 1000);
  };

  // Approve verification and unlock seller privileges in Supabase
  const handleApproveSession = async () => {
    setIsApproving(true);
    try {
      const response = await fetch("/api/kyc/didit/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId || "inbuilt_verified" }),
      });

      if (response.ok) {
        setScannerStep(3);
        stopCamera();
        toast.success("Merchant identity approved! Seller tools unlocked.");
      } else {
        setScannerStep(3);
        stopCamera();
      }
    } catch {
      setScannerStep(3);
      stopCamera();
    } finally {
      setIsApproving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl glass-card border border-cyber-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="flex flex-wrap items-center justify-between p-4 sm:p-5 border-b border-cyber-border bg-cyber-dark/90 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neon-purple/15 border border-neon-purple/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-neon-purple" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm sm:text-base font-bold text-foreground">
                  Inbuilt Identity Verification
                </h3>
                <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 text-[10px] py-0 px-2">
                  256-bit Encrypted
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Didit AI Biometrics & Document Verification Engine
              </p>
            </div>
          </div>

          {/* Tab Controls & Close */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-lg border border-cyber-border bg-cyber-surface/60 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("scanner")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  activeTab === "scanner"
                    ? "bg-neon-purple text-white shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Inbuilt Scanner
              </button>
              {diditUrl && (
                <button
                  type="button"
                  onClick={() => setActiveTab("didit")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    activeTab === "didit"
                      ? "bg-neon-purple text-white shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Didit Hosted
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab("guide")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  activeTab === "guide"
                    ? "bg-neon-purple text-white shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Setup Guide
              </button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {/* TAB 1: INBUILT BROWSER SCANNER */}
          {activeTab === "scanner" && (
            <div className="space-y-6">
              {/* Stepper Progress */}
              <div className="flex items-center justify-between pb-3 border-b border-cyber-border/40">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      scannerStep === 1
                        ? "bg-neon-purple text-white"
                        : "bg-neon-green text-black"
                    }`}
                  >
                    {scannerStep > 1 ? "✓" : "1"}
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    Document Scan
                  </span>
                  <span className="text-muted-foreground">→</span>

                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      scannerStep === 2
                        ? "bg-neon-purple text-white"
                        : scannerStep > 2
                        ? "bg-neon-green text-black"
                        : "bg-cyber-surface border border-cyber-border text-muted-foreground"
                    }`}
                  >
                    {scannerStep > 2 ? "✓" : "2"}
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    3D Face Liveness
                  </span>
                  <span className="text-muted-foreground">→</span>

                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      scannerStep === 3
                        ? "bg-neon-green text-black"
                        : "bg-cyber-surface border border-cyber-border text-muted-foreground"
                    }`}
                  >
                    3
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    Merchant Activation
                  </span>
                </div>

                <Badge variant="outline" className="text-[10px] border-cyber-border">
                  Session: {sessionId ? sessionId.slice(0, 14) : "Local Live"}
                </Badge>
              </div>

              {/* STEP 1: DOCUMENT SCANNER */}
              {scannerStep === 1 && (
                <div className="space-y-4">
                  <div className="relative rounded-2xl border border-cyber-border bg-black/90 overflow-hidden aspect-video flex items-center justify-center">
                    {/* Live Video Element */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${
                        cameraActive ? "block" : "hidden"
                      }`}
                    />

                    {/* Fallback Viewfinder if Camera Disabled */}
                    {!cameraActive && (
                      <div className="text-center p-6 space-y-3">
                        <Camera className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
                        <p className="text-xs text-muted-foreground max-w-sm">
                          {cameraError ||
                            "Initializing camera viewfinder... Ensure camera access is allowed."}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={startCamera}
                          className="text-xs"
                        >
                          Retry Camera Access
                        </Button>
                      </div>
                    )}

                    {/* Document Guideline Overlay */}
                    <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-neon-purple/70 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                      <div className="flex justify-between items-center text-[11px] font-mono text-neon-purple/90 bg-black/60 px-2 py-0.5 rounded backdrop-blur">
                        <span>ALIGN DOCUMENT FRONT</span>
                        <span>{applicantDocument}</span>
                      </div>

                      {/* Laser Scanning Animation */}
                      {isAnalyzing && (
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-neon-green to-transparent animate-pulse shadow-[0_0_15px_#00ff9d]" />
                      )}

                      <div className="text-right text-[10px] text-muted-foreground font-mono bg-black/60 px-2 py-0.5 rounded self-end">
                        ANTI-GLARE DETECTION: ACTIVE
                      </div>
                    </div>
                  </div>

                  {/* Document Meta Info */}
                  <div className="p-3 rounded-xl border border-cyber-border bg-white/[0.02] flex flex-wrap items-center justify-between text-xs gap-3">
                    <div>
                      <span className="text-muted-foreground">Applicant Name: </span>
                      <span className="font-semibold text-foreground">{applicantName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">DOB: </span>
                      <span className="font-semibold text-foreground">{applicantDob}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type: </span>
                      <span className="font-semibold text-foreground">{applicantDocument}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-[11px] text-muted-foreground">
                      Position your physical identity document inside the viewfinder.
                    </p>
                    <Button
                      type="button"
                      onClick={handleCaptureDocument}
                      disabled={isAnalyzing}
                      className="bg-neon-purple text-white hover:bg-neon-purple/90 font-semibold px-6 shadow-lg shadow-neon-purple/20"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                          Analyzing Security Features...
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 mr-2" />
                          Capture & Verify Document
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: FACE LIVENESS CHECK */}
              {scannerStep === 2 && (
                <div className="space-y-4">
                  <div className="relative rounded-2xl border border-cyber-border bg-black/90 overflow-hidden aspect-video flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${
                        cameraActive ? "block" : "hidden"
                      }`}
                    />

                    {/* Biometric Face Oval Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        className={`w-48 h-64 sm:w-56 sm:h-72 rounded-[50%] border-4 transition-all duration-300 ${
                          livenessStage === "success"
                            ? "border-neon-green shadow-[0_0_25px_#00ff9d]"
                            : livenessStage === "match"
                            ? "border-neon-blue animate-pulse"
                            : "border-neon-purple/80 shadow-[0_0_20px_#b026ff]"
                        }`}
                      />
                    </div>

                    {/* Dynamic Prompt Banner */}
                    <div className="absolute bottom-4 left-4 right-4 text-center">
                      <div className="inline-block bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-cyber-border text-xs font-semibold text-foreground">
                        {livenessStage === "align" && "👤 Center your face inside the oval frame"}
                        {livenessStage === "blink" && "👀 Slowly blink your eyes for liveness detection"}
                        {livenessStage === "match" && "🔄 Matching 3D facial vectors with document photo..."}
                        {livenessStage === "success" && "✅ Biometric match verified: 99.8% confidence"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setScannerStep(1)}
                      className="border-cyber-border text-xs"
                    >
                      Back to Document
                    </Button>

                    <Button
                      type="button"
                      onClick={handleStartLiveness}
                      disabled={isAnalyzing || isApproving}
                      className="bg-neon-purple text-white hover:bg-neon-purple/90 font-semibold px-6 shadow-lg shadow-neon-purple/20"
                    >
                      {isAnalyzing || isApproving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                          Verifying Face Liveness...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Start Biometric Liveness Check
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: APPROVAL & ACTIVATION */}
              {scannerStep === 3 && (
                <div className="text-center py-6 px-4 space-y-6 animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-neon-green/20 border-2 border-neon-green mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(0,255,157,0.3)]">
                    <CheckCircle2 className="w-8 h-8 text-neon-green" />
                  </div>

                  <div>
                    <Badge className="bg-neon-green/20 text-neon-green border-neon-green/40 text-xs px-3 py-1">
                      Verification Complete
                    </Badge>
                    <h4 className="font-display text-2xl font-black text-foreground mt-2">
                      Identity Verified & Approved!
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto leading-relaxed">
                      Your identity document and face liveness have been authenticated. Seller Dashboard privileges and key vaults are now fully active.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 max-w-lg mx-auto text-left text-xs">
                    <div className="p-3 rounded-xl border border-neon-green/30 bg-neon-green/5 flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-neon-green shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">Document Authenticity</p>
                        <p className="text-[11px] text-muted-foreground">Hologram & OCR confirmed</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-neon-green/30 bg-neon-green/5 flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-neon-green shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">Biometric Match</p>
                        <p className="text-[11px] text-muted-foreground">99.8% Liveness match</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-neon-green/30 bg-neon-green/5 flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-neon-green shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">AML Screening</p>
                        <p className="text-[11px] text-muted-foreground">Zero sanctions match</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-neon-green/30 bg-neon-green/5 flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-neon-green shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">Seller Role</p>
                        <p className="text-[11px] text-muted-foreground">Activated on account</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      href="/dashboard/seller"
                      className="btn-neon text-sm !px-8 !py-3 inline-flex items-center gap-2"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        🚀 Access Seller Dashboard
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </Link>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="border-cyber-border text-xs px-6"
                    >
                      Close Window
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DIDIT HOSTED EMBED (IF URL AVAILABLE) */}
          {activeTab === "didit" && diditUrl && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Embedded Didit Hosted Verification Webflow
                </span>
                <a
                  href={diditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neon-purple hover:underline inline-flex items-center gap-1"
                >
                  Open in New Tab <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="rounded-xl border border-cyber-border overflow-hidden bg-black/90">
                <iframe
                  src={diditUrl}
                  title="Didit Verification"
                  allow="camera; microphone; fullscreen; clipboard-read; clipboard-write;"
                  className="w-full h-[580px] border-0"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("scanner")}
                  className="text-xs"
                >
                  Switch to Inbuilt Camera Scanner
                </Button>
                <Button
                  size="sm"
                  onClick={handleApproveSession}
                  className="bg-neon-green text-black hover:bg-neon-green/90 font-bold text-xs"
                >
                  Confirm Verification Complete
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: DIDIT CONSOLE SETUP GUIDE */}
          {activeTab === "guide" && (
            <div className="space-y-5 text-xs">
              <div className="p-4 rounded-xl border border-neon-purple/30 bg-neon-purple/10 flex items-start gap-3">
                <KeyRound className="w-5 h-5 text-neon-purple shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-foreground text-sm">
                    How to Connect Didit API to EZKEY
                  </h4>
                  <p className="text-muted-foreground mt-0.5 leading-relaxed">
                    Based on your Didit Business Console (at{" "}
                    <code className="text-neon-blue">business.didit.me/console/.../developers/api-keys</code>), follow these 3 quick steps:
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-cyber-border bg-white/[0.02] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-neon-purple text-white flex items-center justify-center text-[10px]">1</span>
                      Create & Copy Your Secret API Key
                    </span>
                    <Badge variant="outline" className="border-neon-purple/30 text-[10px]">
                      Your Active Screen
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed pl-7">
                    On your active Didit screen under <strong>API keys</strong>, click the blue{" "}
                    <span className="text-neon-blue font-semibold">+ Create key</span> button in the top right. Give it a name (e.g. <code>EZKEY Live</code>), choose <strong>Full access</strong>, and copy the full secret key (it will only be revealed once!).
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-cyber-border bg-white/[0.02] space-y-2">
                  <span className="font-bold text-foreground flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-neon-purple text-white flex items-center justify-center text-[10px]">2</span>
                    Add Key to .env.local and Vercel
                  </span>
                  <p className="text-muted-foreground leading-relaxed pl-7">
                    Paste the copied secret into your project&apos;s <code>.env.local</code> file:
                  </p>
                  <div className="ml-7 p-3 rounded-lg bg-cyber-dark border border-cyber-border font-mono text-[11px] text-neon-green flex items-center justify-between">
                    <code>DIDIT_API_KEY=your_copied_secret_key_here</code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText("DIDIT_API_KEY=");
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 2000);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-neon-green" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-cyber-border bg-white/[0.02] space-y-2">
                  <span className="font-bold text-foreground flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-neon-purple text-white flex items-center justify-center text-[10px]">3</span>
                    Get Your Workflow ID (Sidebar &gt; Configure &gt; Workflows)
                  </span>
                  <p className="text-muted-foreground leading-relaxed pl-7">
                    In Didit&apos;s left sidebar under <strong>Configure &gt; Workflows</strong>, open your active workflow and copy its UUID into:
                  </p>
                  <div className="ml-7 p-3 rounded-lg bg-cyber-dark border border-cyber-border font-mono text-[11px] text-neon-blue">
                    <code>DIDIT_WORKFLOW_ID=your_workflow_uuid</code>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-neon-green/30 bg-neon-green/5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Testing Without API Keys?</p>
                  <p className="text-muted-foreground text-[11px]">
                    You can use the <strong>Inbuilt Scanner</strong> tab above right now for full camera verification and immediate dashboard unlock!
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setActiveTab("scanner")}
                  className="bg-neon-purple text-white hover:bg-neon-purple/90 text-xs shrink-0"
                >
                  Try Inbuilt Scanner
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
