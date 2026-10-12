"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart, MessageSquare, Share2, LogIn, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { hasEnvVars } from "@/lib/utils";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { toast } from "sonner";

interface ProductActionsProps {
  listingSlug: string;
  stockCount: number;
}

export default function ProductActions({ listingSlug, stockCount }: ProductActionsProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const supabase = useMemo(() => (hasEnvVars ? createClient() : null), []);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const redirectToLogin = (reason: string) => {
    toast.info("Please log in", {
      description: `You must be logged in to ${reason}.`,
    });
    router.push(
      `/auth/login?redirectedFrom=${encodeURIComponent(`/marketplace/${listingSlug}`)}`,
    );
  };

  const handleBuyNow = () => {
    if (!user) {
      redirectToLogin("complete a purchase");
      return;
    }
    toast.success("Order initiated!", {
      description: "Redirecting to checkout...",
    });
    router.push(`/dashboard/buyer/orders`);
  };

  const handleAddToCart = () => {
    if (!user) {
      redirectToLogin("add items to your cart");
      return;
    }
    toast.success("Added to cart!", {
      description: "Item saved to your shopping cart.",
    });
  };

  const handleWishlist = () => {
    if (!user) {
      redirectToLogin("add items to your wishlist");
      return;
    }
    setIsWishlisted((prev) => !prev);
    toast.success(!isWishlisted ? "Added to wishlist!" : "Removed from wishlist");
  };

  const handleMessage = () => {
    if (!user) {
      redirectToLogin("contact the seller");
      return;
    }
    router.push("/dashboard/buyer/messages");
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/marketplace/${listingSlug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!", {
        description: "Product link copied to clipboard.",
      });
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="space-y-3">
      {/* Primary Actions: Buy Now & Add to Cart */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <button
          type="button"
          className="btn-neon flex-1 text-base !py-3.5 group shadow-lg shadow-neon-purple/20"
          disabled={stockCount <= 0}
          onClick={handleBuyNow}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {user ? (
              <>
                <ShoppingCart className="w-5 h-5" />
                Buy Now
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Log In to Buy
              </>
            )}
          </span>
        </button>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={stockCount <= 0}
          className="px-5 py-3.5 rounded-xl border border-neon-blue/40 bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add to Cart
        </button>
      </div>

      {/* Secondary actions: Wishlist, Message, Share */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleWishlist}
          className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded-xl text-sm transition-all ${
            isWishlisted
              ? "border-red-500/50 bg-red-500/10 text-red-400"
              : "border-cyber-border text-muted-foreground hover:text-foreground hover:border-neon-purple/30 bg-cyber-card/40"
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-400 text-red-400" : ""}`} />
          {isWishlisted ? "Saved" : "Wishlist"}
        </button>

        <button
          type="button"
          onClick={handleMessage}
          className="flex-1 flex items-center justify-center gap-2 py-3 border border-cyber-border bg-cyber-card/40 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-neon-blue/30 transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          Message
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="py-3 px-4 border border-cyber-border bg-cyber-card/40 rounded-xl text-muted-foreground hover:text-foreground hover:border-neon-green/30 transition-all"
          title="Share listing"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
