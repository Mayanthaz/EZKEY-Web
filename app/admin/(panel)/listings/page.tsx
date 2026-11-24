"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import {
  FilterSelect,
  InlineSelect,
  PageHeader,
  Pagination,
  SearchBox,
  TableCard,
  TableState,
  tdClass,
  thClass,
} from "@/components/admin/AdminKit";
import { Button } from "@/components/ui/button";
import { adminFetch, dateTime, money, useAdminList } from "@/lib/admin/api";

type ListingRow = {
  id: string;
  title: string;
  slug: string;
  price: number;
  status: string;
  featured: boolean;
  stock_count: number;
  sold_count: number;
  view_count: number;
  created_at: string;
  seller: { username: string } | null;
  category: { name: string } | null;
};

const STATUSES = ["draft", "active", "paused", "sold_out", "removed"];

export default function AdminListingsPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const { data, loading, error, reload } = useAdminList<ListingRow>("/listings", { page, q, status });

  const onSearch = useCallback((value: string) => {
    setQ(value);
    setPage(1);
  }, []);

  const update = async (l: ListingRow, patch: Record<string, unknown>, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    try {
      await adminFetch(`/listings/${l.id}`, { method: "PATCH", body: JSON.stringify(patch) });
      toast.success("Listing updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
    await reload();
  };

  return (
    <>
      <PageHeader title="Listings" description="Moderate marketplace listings." />
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchBox placeholder="Search title…" onSearch={onSearch} />
        <FilterSelect label="statuses" value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={STATUSES} />
      </div>

      <TableCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-cyber-border">
              <tr>
                <th className={thClass}>Listing</th>
                <th className={thClass}>Seller</th>
                <th className={thClass}>Price</th>
                <th className={thClass}>Stock / Sold</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Featured</th>
                <th className={thClass}>Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border">
              <TableState loading={loading} error={error} empty={!data?.rows.length} colSpan={7} />
              {data?.rows.map((l) => (
                <tr key={l.id} className="hover:bg-white/[0.02]">
                  <td className={tdClass}>
                    <p className="max-w-[18rem] truncate font-medium">{l.title}</p>
                    <p className="text-xs text-muted-foreground">{l.category?.name ?? "—"}</p>
                  </td>
                  <td className={tdClass}>@{l.seller?.username ?? "unknown"}</td>
                  <td className={tdClass}>{money(l.price)}</td>
                  <td className={tdClass}>{l.stock_count} / {l.sold_count}</td>
                  <td className={tdClass}>
                    <InlineSelect
                      label={`Status of ${l.title}`}
                      value={l.status}
                      options={STATUSES}
                      onChange={(status) =>
                        update(l, { status }, status === "removed" ? `Remove "${l.title}" from the marketplace?` : undefined)
                      }
                    />
                  </td>
                  <td className={tdClass}>
                    <Button
                      size="icon"
                      variant="ghost"
                      className={l.featured ? "text-neon-orange" : "text-muted-foreground"}
                      aria-label={l.featured ? "Unfeature listing" : "Feature listing"}
                      onClick={() => update(l, { featured: !l.featured })}
                    >
                      <Star className={`h-4 w-4 ${l.featured ? "fill-current" : ""}`} />
                    </Button>
                  </td>
                  <td className={`${tdClass} whitespace-nowrap text-muted-foreground`}>{dateTime(l.created_at)}</td>
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
