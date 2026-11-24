"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import {
  FilterSelect,
  PageHeader,
  Pagination,
  StatusBadge,
  TableCard,
  TableState,
  tdClass,
  thClass,
} from "@/components/admin/AdminKit";
import { Button } from "@/components/ui/button";
import { adminFetch, dateTime, useAdminList } from "@/lib/admin/api";

type VerificationRow = {
  id: string;
  user_id: string;
  status: string;
  application_status: string;
  verification_url: string | null;
  submitted_details: Record<string, unknown> | null;
  created_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  user: { username: string; display_name: string | null; role: string } | null;
};

const STATUSES = ["pending", "submitted", "verified", "rejected"];

export default function AdminVerificationsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const { data, loading, error, reload } = useAdminList<VerificationRow>("/verifications", { page, status });

  const decide = async (row: VerificationRow, decision: "approve" | "reject") => {
    const name = row.user?.username ?? "this user";
    const verb = decision === "approve" ? "Approve seller access for" : "Reject the seller application of";
    if (!window.confirm(`${verb} @${name}?`)) return;
    try {
      await adminFetch(`/verifications/${row.id}/decision`, {
        method: "POST",
        body: JSON.stringify({ decision }),
      });
      toast.success(decision === "approve" ? `@${name} is now a verified seller` : `Rejected @${name}`);
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    }
  };

  return (
    <>
      <PageHeader title="Seller KYC" description="Review seller verification applications." />
      <FilterSelect label="statuses" value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={STATUSES} />

      <TableCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-cyber-border">
              <tr>
                <th className={thClass}>Applicant</th>
                <th className={thClass}>Application</th>
                <th className={thClass}>Provider status</th>
                <th className={thClass}>Submitted</th>
                <th className={thClass}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border">
              <TableState loading={loading} error={error} empty={!data?.rows.length} colSpan={5} />
              {data?.rows.map((v) => (
                <tr key={v.id} className="hover:bg-white/[0.02]">
                  <td className={tdClass}>
                    <p className="font-medium">{v.user?.display_name || v.user?.username || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">@{v.user?.username} · {v.user?.role}</p>
                  </td>
                  <td className={tdClass}><StatusBadge value={v.application_status} /></td>
                  <td className={`${tdClass} text-muted-foreground`}>{v.status}</td>
                  <td className={`${tdClass} whitespace-nowrap text-muted-foreground`}>{dateTime(v.created_at)}</td>
                  <td className={tdClass}>
                    <div className="flex gap-2">
                      {v.application_status !== "verified" && (
                        <Button size="sm" variant="outline" className="border-neon-green/30 text-neon-green hover:bg-neon-green/10" onClick={() => decide(v, "approve")}>
                          <Check className="h-3.5 w-3.5" /> Approve
                        </Button>
                      )}
                      {v.application_status !== "rejected" && (
                        <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => decide(v, "reject")}>
                          <X className="h-3.5 w-3.5" /> Reject
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={data?.pageSize ?? 20} total={data?.total ?? 0} onPage={setPage} />
      </TableCard>
    </>
  );
}
