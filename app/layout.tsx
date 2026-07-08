import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatbotFab from "@/components/chatbot-fab";
import SupabaseAuthErrorRedirect from "@/components/auth/SupabaseAuthErrorRedirect";
import { Suspense } from "react";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "EZKEY — Your Premium Gaming Marketplace",
    template: "%s | EZKEY",
  },
  description:
    "Buy and sell game keys, in-game items, gift cards, and digital gaming assets securely with escrow protection. Instant delivery, buyer protection, 24/7 support.",
  keywords: [
    "game keys",
    "gaming marketplace",
    "buy game keys",
    "sell game keys",
    "steam keys",
    "in-game items",
    "gift cards",
    "digital marketplace",
    "escrow",
    "EZKEY",
  ],
  openGraph: {
    title: "EZKEY — Your Premium Gaming Marketplace",
    description:
      "Buy and sell game keys, in-game items, and digital gaming assets securely with escrow protection.",
    type: "website",
    locale: "en_US",
    siteName: "EZKEY",
  },
  twitter: {
    card: "summary_large_image",
    title: "EZKEY — Your Premium Gaming Marketplace",
    description:
      "Buy and sell game keys, in-game items, and digital gaming assets securely with escrow protection.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const inter = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.className} antialiased bg-cyber-dark text-foreground custom-scrollbar`}
      >
        <Suspense fallback={null}>
          <SupabaseAuthErrorRedirect />
        </Suspense>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <ChatbotFab />
      </body>
    </html>
  );
}
