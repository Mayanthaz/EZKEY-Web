"use client";

import { useState, useEffect } from "react";
import {
  Gamepad2,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  KeyRound,
  PauseCircle,
  PlayCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { KeyVaultModal } from "@/components/seller/KeyVaultModal";
import { PLATFORM_LABELS } from "@/lib/constants";
import { toast } from "sonner";

export default function SellerListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Key Vault Modal State
  const [vaultListing, setVaultListing] = useState<{ id: string; title: string } | null>(null);

  // Delete Alert State
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/seller/listings");
      const data = await res.json();
      if (res.ok) {
        setListings(data.listings || []);
      } else {
        toast.error(data.error || "Failed to load listings");
      }
    } catch {
      toast.error("Failed to connect to internal listings API");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (item: any) => {
    const nextStatus = item.status === "active" ? "paused" : "active";
    try {
      const res = await fetch(`/api/seller/listings/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Listing marked as ${nextStatus}`);
        setListings((prev) =>
          prev.map((l) => (l.id === item.id ? { ...l, status: nextStatus } : l))
        );
      } else {
        toast.error(data.error || "Failed to update status");
      }
    } catch {
      toast.error("Status update failed");
    }
  };

  const handleDeleteListing = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/seller/listings/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Listing removed successfully");
        setListings((prev) => prev.filter((l) => l.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        toast.error(data.error || "Failed to delete listing");
      }
    } catch {
      toast.error("Error deleting listing");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredListings = listings.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.platform?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === "all") return true;
    return l.status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">My Product Listings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your digital products, vault license keys, and inventory status.
          </p>
        </div>
        <Link
          href="/dashboard/seller/listings/new"
          className="btn-neon text-sm !px-5 !py-2.5 w-fit inline-flex items-center gap-2"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Listing
          </span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search listings by title or platform..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-fit">
          <TabsList className="bg-cyber-card border border-cyber-border">
            <TabsTrigger value="all">All ({listings.length})</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="paused">Paused</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Listings List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-neon-purple" />
          <p className="text-xs">Loading listings from internal server...</p>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-3">
          <Gamepad2 className="w-12 h-12 text-cyber-border mx-auto opacity-50" />
          <h3 className="text-base font-bold">No product listings found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery
              ? "No listings match your search criteria."
              : "Get started by publishing your first digital key or service listing."}
          </p>
          <Link
            href="/dashboard/seller/listings/new"
            className="btn-neon text-xs !px-4 !py-2 inline-flex items-center gap-1.5 mt-2"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Create First Listing
            </span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredListings.map((listing) => {
            const isPaused = listing.status === "paused";
            const isDraft = listing.status === "draft";
            const isSoldOut = listing.stock_count <= 0;

            return (
              <div
                key={listing.id}
                className="glass-card flex flex-col sm:flex-row sm:items-center gap-4 p-4 group transition-all hover:border-cyber-border"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl bg-cyber-surface border border-cyber-border overflow-hidden shrink-0 flex items-center justify-center">
                  {listing.thumbnail_url ? (
                    <img
                      src={listing.thumbnail_url}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/assets/placeholder-game.png";
                      }}
                    />
                  ) : (
                    <Gamepad2 className="w-7 h-7 text-cyber-border" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold truncate text-foreground">
                      {listing.title}
                    </h3>
                    <Badge
                      variant={
                        listing.status === "active"
                          ? "default"
                          : listing.status === "paused"
                          ? "outline"
                          : "secondary"
                      }
                      className="text-[10px] uppercase font-bold shrink-0"
                    >
                      {listing.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">
                      {PLATFORM_LABELS[listing.platform] || listing.platform}
                    </span>
                    <span>•</span>
                    <span className={isSoldOut ? "text-red-400 font-semibold" : ""}>
                      {listing.stock_count} in stock
                    </span>
                    <span>•</span>
                    <span>{listing.sold_count || 0} sold</span>
                    <span>•</span>
                    <span className="capitalize">{listing.delivery_type} delivery</span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="text-left sm:text-right shrink-0">
                  <p className="font-display text-lg font-bold text-neon-green">
                    ${Number(listing.price).toFixed(2)}
                  </p>
                  {listing.original_price && (
                    <p className="text-xs text-muted-foreground line-through">
                      ${Number(listing.original_price).toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-cyber-border/40 shrink-0">
                  {/* Key Vault Trigger */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setVaultListing({ id: listing.id, title: listing.title })
                    }
                    className="h-9 w-9 text-neon-purple hover:bg-neon-purple/10"
                    title="Key Vault & Inventory"
                  >
                    <KeyRound className="w-4 h-4" />
                  </Button>

                  {/* Pause / Resume */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleStatus(listing)}
                    className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-white/5"
                    title={isPaused ? "Resume Listing" : "Pause Listing"}
                  >
                    {isPaused ? (
                      <PlayCircle className="w-4 h-4 text-neon-green" />
                    ) : (
                      <PauseCircle className="w-4 h-4 text-yellow-400" />
                    )}
                  </Button>

                  {/* Edit */}
                  <Link href={`/dashboard/seller/listings/${listing.id}/edit`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-neon-blue hover:bg-neon-blue/10"
                      title="Edit Listing"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>

                  {/* Delete */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(listing)}
                    className="h-9 w-9 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                    title="Delete Listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Key Vault Modal */}
      <KeyVaultModal
        listingId={vaultListing?.id || null}
        listingTitle={vaultListing?.title || ""}
        isOpen={!!vaultListing}
        onClose={() => setVaultListing(null)}
        onStockUpdated={(newStock) => {
          if (vaultListing) {
            setListings((prev) =>
              prev.map((l) =>
                l.id === vaultListing.id ? { ...l, stock_count: newStock } : l
              )
            );
          }
        }}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product Listing?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This action will remove the listing from the marketplace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteListing}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Listing"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
