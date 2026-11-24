"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  FilterSelect,
  InlineSelect,
  PageHeader,
  Pagination,
  SearchBox,
  StatusBadge,
  TableCard,
  TableState,
  tdClass,
  thClass,
} from "@/components/admin/AdminKit";
import { useAdmin } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { adminFetch, dateTime, money, useAdminList } from "@/lib/admin/api";

type UserRow = {
  id: string;
  username: string;
  display_name: string | null;
  role: "buyer" | "seller" | "admin";
  balance: number;
  is_verified: boolean;
  total_sales: number;
  total_purchases: number;
  created_at: string;
};

const ROLES = ["buyer", "seller", "admin"];

export default function AdminUsersPage() {
  const me = useAdmin();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const { data, loading, error, reload } = useAdminList<UserRow>("/users", { page, q, role });

  const onSearch = useCallback((value: string) => {
    setQ(value);
    setPage(1);
  }, []);

  const update = async (user: UserRow, patch: Record<string, unknown>, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    try {
      await adminFetch(`/users/${user.id}`, { method: "PATCH", body: JSON.stringify(patch) });
      toast.success(`Updated ${user.username}`);
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
      await reload();
    }
  };

  return (
    <>
      <PageHeader title="Users" description="Manage accounts, roles and verification." />
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchBox placeholder="Search username or name…" onSearch={onSearch} />
        <FilterSelect label="roles" value={role} onChange={(v) => { setRole(v); setPage(1); }} options={ROLES} />
      </div>

      <TableCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-cyber-border">
              <tr>
                <th className={thClass}>User</th>
                <th className={thClass}>Role</th>
                <th className={thClass}>Verified</th>
                <th className={thClass}>Balance</th>
                <th className={thClass}>Sales / Purchases</th>
                <th className={thClass}>Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border">
              <TableState loading={loading} error={error} empty={!data?.rows.length} colSpan={6} />
              {data?.rows.map((u) => {
                const isSelf = u.id === me.id;
                return (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className={tdClass}>
                      <p className="font-medium">{u.display_name || u.username}</p>
                      <p className="text-xs text-muted-foreground">@{u.username}{isSelf && " (you)"}</p>
                    </td>
                    <td className={tdClass}>
                      <div className="flex items-center gap-2">
                        <StatusBadge value={u.role} />
                        <InlineSelect
                          label={`Role for ${u.username}`}
                          value={u.role}
                          options={ROLES}
                          disabled={isSelf}
                          onChange={(role) =>
                            update(u, { role }, `Change @${u.username} from ${u.role} to ${role}?`)
                          }
                        />
                      </div>
                    </td>
                    <td className={tdClass}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => update(u, { is_verified: !u.is_verified })}
                      >
                        {u.is_verified ? "Verified · Revoke" : "Unverified · Verify"}
                      </Button>
                    </td>
                    <td className={tdClass}>{money(u.balance)}</td>
                    <td className={tdClass}>{u.total_sales} / {u.total_purchases}</td>
                    <td className={`${tdClass} whitespace-nowrap text-muted-foreground`}>{dateTime(u.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={data?.pageSize ?? 20} total={data?.total ?? 0} onPage={setPage} />
      </TableCard>
    </>
  );
}
