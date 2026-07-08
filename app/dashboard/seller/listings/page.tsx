"use client";

import { Gamepad2, Plus, Edit, Trash2, Eye, ToggleLeft, ToggleRight, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { MOCK_LISTINGS, PLATFORM_LABELS } from "@/lib/constants";

export default function SellerListingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const myListings = MOCK_LISTINGS.filter((l) =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">My Listings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your products</p>
        </div>
        <Link href="/dashboard/seller/listings/new" className="btn-neon text-sm !px-5 !py-2.5 w-fit inline-flex items-center gap-2">
          <span className="relative z-10 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Listing
          </span>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search your listings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-neon !pl-11 max-w-md"
        />
      </div>

      <div className="space-y-3">
        {myListings.map((listing) => (
          <div key={listing.id} className="glass-card flex items-center gap-4 p-4 group">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyber-card to-cyber-surface flex items-center justify-center shrink-0">
              <Gamepad2 className="w-8 h-8 text-cyber-border/50" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold truncate">{listing.title}</h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span>{PLATFORM_LABELS[listing.platform]}</span>
                <span>•</span>
                <span>{listing.stock_count} in stock</span>
                <span>•</span>
                <span>{listing.sold_count} sold</span>
              </div>
            </div>
            <span className="font-display text-lg font-bold text-neon-green hidden sm:block">
              ${listing.price.toFixed(2)}
            </span>
            <span className="badge-success hidden md:inline-flex">Active</span>
            <div className="flex items-center gap-1">
              <button className="p-2 text-muted-foreground hover:text-neon-blue hover:bg-neon-blue/10 rounded-lg transition-all" title="View">
                <Eye className="w-4 h-4" />
              </button>
              <button className="p-2 text-muted-foreground hover:text-neon-purple hover:bg-neon-purple/10 rounded-lg transition-all" title="Edit">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
