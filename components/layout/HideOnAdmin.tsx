"use client";

import { usePathname } from "next/navigation";

/**
 * Renders its children everywhere except under /admin, so the admin panel
 * gets its own chrome instead of the public Navbar / Footer / chatbot.
 */
export default function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname?.startsWith("/admin/")) return null;
  return <>{children}</>;
}
