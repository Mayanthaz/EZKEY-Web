import type { Metadata } from "next";
import MarketplaceClient from "./MarketplaceClient";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Browse thousands of game keys, in-game items, gift cards, and digital gaming assets from verified sellers. Best prices with secure escrow protection.",
};

export default function MarketplacePage() {
  return <MarketplaceClient />;
}
