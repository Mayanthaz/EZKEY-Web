"use client";

import { useCallback, useState } from "react";
import {
  FilterSelect,
  PageHeader,
  Pagination,
  SearchBox,
  StatusBadge,
  TableCard,
  TableState,
  tdClass,
  thClass,
} from "@/components/admin/AdminKit";
import { dateTime, money, useAdminList } from "@/lib/admin/api";

type OrderRow = {
  id: string;
  order_number: string;
  quantity: number;
  total_price: number;
  platform_fee: number;
  status: string;
  created_at: string;
  buyer: { username: string } | null;
  seller: { username: string } | null;
  listing: { title: string } | null;
};

const STATUSES = ["pending", "paid", "processing", "delivered", "completed", "cancelled", "refunded", "disputed"];

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const { data, loading, error } = useAdminList<OrderRow>("/orders", { page, q, status });

  const onSearch = useCallback((value: string) => {
    setQ(value);
    setPage(1);
  }, []);

  return (
    <>
      <PageHeader title="Orders" description="All marketplace orders (read-only)." />
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchBox placeholder="Search order number…" onSearch={onSearch} />
        <FilterSelect label="statuses" value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={STATUSES} />
      </div>

      <TableCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-cyber-border">
              <tr>
                <th className={thClass}>Order</th>
                <th className={thClass}>Item</th>
                <th className={thClass}>Buyer</th>
                <th className={thClass}>Seller</th>
                <th className={thClass}>Total</th>
                <th className={thClass}>Fee</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border">
              <TableState loading={loading} error={error} empty={!data?.rows.length} colSpan={8} />
              {data?.rows.map((o) => (
                <tr key={o.id} className="hover:bg-white/[0.02]">
                  <td className={`${tdClass} font-mono text-xs`}>{o.order_number}</td>
                  <td className={tdClass}>
                    <p className="max-w-[16rem] truncate">{o.listing?.title ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">Qty {o.quantity}</p>
                  </td>
                  <td className={tdClass}>@{o.buyer?.username ?? "unknown"}</td>
                  <td className={tdClass}>@{o.seller?.username ?? "unknown"}</td>
                  <td className={`${tdClass} font-medium`}>{money(o.total_price)}</td>
                  <td className={`${tdClass} text-muted-foreground`}>{money(o.platform_fee)}</td>
                  <td className={tdClass}><StatusBadge value={o.status} /></td>
                  <td className={`${tdClass} whitespace-nowrap text-muted-foreground`}>{dateTime(o.created_at)}</td>
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
