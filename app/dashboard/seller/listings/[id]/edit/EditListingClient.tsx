"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ListingForm } from "@/components/seller/ListingForm";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EditListingClient({ id }: { id: string }) {
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/seller/listings/${id}`);
        const data = await res.json();
        if (res.ok && data.listing) {
          setListing(data.listing);
        } else {
          setError(data.error || "Listing not found");
        }
      } catch {
        setError("Failed to load listing details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-neon-purple" />
        <p className="text-sm text-muted-foreground">
          Loading listing from internal server...
        </p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="glass-card max-w-md mx-auto p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold">Unable to load listing</h2>
        <p className="text-sm text-muted-foreground">
          {error || "Listing does not exist."}
        </p>
        <Button onClick={() => router.push("/dashboard/seller/listings")}>
          Return to My Listings
        </Button>
      </div>
    );
  }

  return <ListingForm initialData={listing} isEditing={true} />;
}
