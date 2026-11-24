"use client";

import { useState } from "react";
import {
  PageHeader,
  Pagination,
  TableCard,
  TableState,
  tdClass,
  thClass,
} from "@/components/admin/AdminKit";
import { dateTime, useAdminList } from "@/lib/admin/api";

type AuditRow = {
  id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  admin: { username: string } | null;
};

export default function AdminAuditPage() {
  const [page, setPage] = useState(1);
  const { data, loading, error } = useAdminList<AuditRow>("/audit-log", { page });

  return (
    <>
      <PageHeader title="Audit Log" description="Every admin login and change, newest first." />
      <TableCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-cyber-border">
              <tr>
                <th className={thClass}>When</th>
                <th className={thClass}>Admin</th>
                <th className={thClass}>Action</th>
                <th className={thClass}>Target</th>
                <th className={thClass}>Details</th>
                <th className={thClass}>IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border">
              <TableState loading={loading} error={error} empty={!data?.rows.length} colSpan={6} />
              {data?.rows.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.02]">
                  <td className={`${tdClass} whitespace-nowrap text-muted-foreground`}>{dateTime(r.created_at)}</td>
                  <td className={tdClass}>@{r.admin?.username ?? "unknown"}</td>
                  <td className={`${tdClass} font-mono text-xs`}>{r.action}</td>
                  <td className={tdClass}>
                    <p className="capitalize">{r.target_type.replace(/_/g, " ")}</p>
                    {r.target_id && <p className="max-w-[10rem] truncate font-mono text-[10px] text-muted-foreground">{r.target_id}</p>}
                  </td>
                  <td className={`${tdClass} max-w-[16rem] truncate font-mono text-[11px] text-muted-foreground`}>
                    {r.details && Object.keys(r.details).length ? JSON.stringify(r.details) : "—"}
                  </td>
                  <td className={`${tdClass} font-mono text-xs text-muted-foreground`}>{r.ip_address ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={data?.pageSize ?? 25} total={data?.total ?? 0} onPage={setPage} />
      </TableCard>
    </>
  );
}
