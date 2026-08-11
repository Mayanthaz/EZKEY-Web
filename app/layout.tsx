import type { Metadata } from "next";
import { Poppins, JetBrains_Mono, Orbitron } from "next/font/google";
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
    default: "EZKEY — Your Premium Digital Marketplace",
    template: "%s | EZKEY",
  },
  description:
    "Buy and sell digital apps, vouchers, keys, accounts, and digital assets securely with escrow protection. Instant delivery, buyer protection, 24/7 support.",
  keywords: [
    "digital apps",
    "digital marketplace",
    "buy digital keys",
    "sell digital keys",
    "vouchers",
    "digital accounts",
    "activation keys",
    "digital marketplace",
    "escrow",
    "EZKEY",
  ],
  openGraph: {
    title: "EZKEY — Your Premium Digital Marketplace",
    description:
      "Buy and sell digital apps, vouchers, keys, accounts, and digital assets securely with escrow protection.",
    type: "website",
    locale: "en_US",
    siteName: "EZKEY",
  },
  twitter: {
    card: "summary_large_image",
    title: "EZKEY — Your Premium Digital Marketplace",
    description:
      "Buy and sell digital apps, vouchers, keys, accounts, and digital assets securely with escrow protection.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const poppins = Poppins({
  variable: "--font-poppins",
  display: "swap",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  display: "swap",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  display: "swap",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${orbitron.variable} ${jetBrainsMono.variable} font-sans antialiased bg-cyber-dark text-foreground custom-scrollbar`}
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
