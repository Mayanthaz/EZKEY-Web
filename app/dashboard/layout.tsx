import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

function DashboardLayoutFallback() {
  return (
    <div className="flex min-h-screen bg-cyber-dark pt-16 lg:pt-[4.5rem]">
      <div className="hidden lg:flex w-64 border-r border-cyber-border bg-cyber-darker/50 p-4 animate-pulse" />
      <main className="flex-1 p-6 lg:p-8 animate-pulse space-y-4">
        <div className="h-8 w-48 rounded-lg bg-cyber-card" />
        <div className="h-40 rounded-xl bg-cyber-card" />
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardLayoutFallback />}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
