"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, X } from "lucide-react";

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
        <div className="glass-card absolute bottom-16 right-0 w-72 origin-bottom-right animate-scale-in p-4 sm:w-80">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Contact Support</p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close support form"
              className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Tell us what&apos;s wrong. We&apos;ll open Gmail to{" "}
            <span className="text-neon-blue">{SUPPORT_EMAIL}</span> with your
            problem as the subject.
          </p>
          <form onSubmit={handleSend} className="space-y-3">
            <input
              ref={inputRef}
              type="text"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Describe your problem..."
              maxLength={150}
              className="input-neon !py-2.5 text-sm"
            />
            <button
              type="submit"
              disabled={!problem.trim()}
              className="btn-neon flex w-full items-center justify-center gap-2 !py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Send className="h-3.5 w-3.5" />
                Send via Gmail
              </span>
            </button>
          </form>
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
