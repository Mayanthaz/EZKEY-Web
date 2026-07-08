import Link from "next/link";
import { Bot } from "lucide-react";

export default function ChatbotFab() {
  return (
    <Link
      href="/dashboard/buyer/messages"
      aria-label="Open chatbot"
      title="Chat with support"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 group"
    >
      <span className="absolute inset-0 rounded-full bg-neon-blue/30 blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-neon-green border border-cyber-dark animate-pulse" />
      <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-neon-green/20 animate-ping" />
      <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-neon-blue/40 bg-cyber-card/90 text-neon-blue shadow-[0_0_24px_rgba(6,182,212,0.35)] backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:border-neon-blue/70 group-hover:text-white">
        <Bot className="h-5 w-5" />
      </span>
    </Link>
  );
}