"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const SUPPORT_EMAIL = "ezkeysupport@gmail.com";

function buildGmailComposeUrl(subject: string) {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: SUPPORT_EMAIL,
    su: subject,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export default function ChatbotFab() {
  const [isOpen, setIsOpen] = useState(false);
  const [problem, setProblem] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    inputRef.current?.focus();

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = problem.trim();
    if (!subject) return;

    window.open(buildGmailComposeUrl(subject), "_blank", "noopener,noreferrer");
    setProblem("");
    setIsOpen(false);
  };

  return (
    <div ref={panelRef} className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {isOpen && (
        <div className="glass-card absolute bottom-16 right-0 w-72 origin-bottom-right animate-scale-in sm:w-80 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-neon-blue/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-neon-blue" />
              </div>
              <p className="text-sm font-semibold text-foreground">Contact Support</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Close support form"
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-white/[0.06] rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Body */}
          <div className="p-4">
            <p className="mb-4 text-xs text-muted-foreground leading-relaxed">
              Tell us what&apos;s wrong. We&apos;ll open Gmail to{" "}
              <span className="text-neon-blue font-medium">{SUPPORT_EMAIL}</span> with your
              problem as the subject.
            </p>
            <form onSubmit={handleSend} className="space-y-3">
              <Input
                ref={inputRef}
                type="text"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="Describe your problem..."
                maxLength={150}
                className="bg-white/[0.03] border-white/10 focus:border-neon-purple/60 focus-visible:ring-neon-purple/20 text-foreground placeholder:text-muted-foreground/50 text-sm"
              />
              <Button
                type="submit"
                disabled={!problem.trim()}
                className="btn-neon border-0 w-full !py-2.5 text-sm"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Send className="h-3.5 w-3.5" />
                  Send via Gmail
                </span>
              </Button>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Contact support"
        aria-expanded={isOpen}
        title="Contact support"
        className="group relative block"
      >
        <span className="absolute inset-0 rounded-full bg-neon-blue/30 blur-md opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full border border-cyber-dark bg-neon-green animate-pulse" />
        <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-neon-green/20 animate-ping" />
        <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-neon-blue/40 bg-cyber-card/90 text-neon-blue shadow-[0_0_24px_rgba(6,182,212,0.35)] backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:border-neon-blue/70 group-hover:text-white">
          {isOpen ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        </span>
      </button>
    </div>
  );
}
