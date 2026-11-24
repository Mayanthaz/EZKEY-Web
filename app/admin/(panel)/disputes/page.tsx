"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  FilterSelect,
  InlineSelect,
  PageHeader,
  Pagination,
  StatusBadge,
  TableCard,
  TableState,
  tdClass,
  thClass,
} from "@/components/admin/AdminKit";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { adminFetch, dateTime, money, useAdminList } from "@/lib/admin/api";

type DisputeRow = {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  resolution: string | null;
  created_at: string;
  resolved_at: string | null;
  initiator: { username: string } | null;
  against: { username: string } | null;
  order: { order_number: string; total_price: number } | null;
};

const STATUSES = ["open", "under_review", "resolved_buyer", "resolved_seller", "closed"];

export default function AdminDisputesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const { data, loading, error, reload } = useAdminList<DisputeRow>("/disputes", { page, status });

  const [editing, setEditing] = useState<DisputeRow | null>(null);
  const [newStatus, setNewStatus] = useState("open");
  const [resolution, setResolution] = useState("");
  const [saving, setSaving] = useState(false);

  const openEditor = (d: DisputeRow) => {
    setEditing(d);
    setNewStatus(d.status);
    setResolution(d.resolution ?? "");
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await adminFetch(`/disputes/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus, resolution }),
      });
      toast.success("Dispute updated");
      setEditing(null);
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Disputes" description="Review and resolve order disputes." />
      <FilterSelect label="statuses" value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={STATUSES} />

      <TableCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-cyber-border">
              <tr>
                <th className={thClass}>Order</th>
                <th className={thClass}>Parties</th>
                <th className={thClass}>Reason</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Opened</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border">
              <TableState loading={loading} error={error} empty={!data?.rows.length} colSpan={6} />
              {data?.rows.map((d) => (
                <tr key={d.id} className="hover:bg-white/[0.02]">
                  <td className={tdClass}>
                    <p className="font-mono text-xs">{d.order?.order_number ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{money(d.order?.total_price)}</p>
                  </td>
                  <td className={tdClass}>
                    <p>@{d.initiator?.username ?? "unknown"}</p>
                    <p className="text-xs text-muted-foreground">vs @{d.against?.username ?? "unknown"}</p>
                  </td>
                  <td className={tdClass}>
                    <p className="capitalize">{d.reason.replace(/_/g, " ")}</p>
                    {d.description && <p className="max-w-[18rem] truncate text-xs text-muted-foreground">{d.description}</p>}
                  </td>
                  <td className={tdClass}><StatusBadge value={d.status} /></td>
                  <td className={`${tdClass} whitespace-nowrap text-muted-foreground`}>{dateTime(d.created_at)}</td>
                  <td className={tdClass}>
                    <Button size="sm" variant="outline" onClick={() => openEditor(d)}>Review</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={data?.pageSize ?? 20} total={data?.total ?? 0} onPage={setPage} />
      </TableCard>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="border-cyber-border bg-cyber-card">
          <DialogHeader>
            <DialogTitle>Dispute {editing?.order?.order_number}</DialogTitle>
            <DialogDescription>
              Recording a decision here does not move escrow funds or change the order. Handle any refund
              or payout separately.
            </DialogDescription>
          </DialogHeader>
          {editing?.description && (
            <p className="rounded-md border border-cyber-border bg-white/[0.03] p-3 text-sm">{editing.description}</p>
          )}
          <div className="space-y-3">
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Status</p>
              <InlineSelect label="Dispute status" value={newStatus} options={STATUSES} onChange={setNewStatus} />
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Resolution note</p>
              <Textarea
                value={resolution}
                maxLength={2000}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Explain the decision…"
                className="border-white/10 bg-white/[0.03]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
