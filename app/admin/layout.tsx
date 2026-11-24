import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin Panel", template: "%s | EZKEY Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-cyber-dark">{children}</div>;
}
