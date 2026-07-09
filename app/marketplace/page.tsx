import type { Metadata } from "next";
import MarketplaceClient from "./MarketplaceClient";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Browse thousands of digital apps, vouchers, keys, accounts, and digital assets from verified sellers. Best prices with secure escrow protection.",
};

export default function MarketplacePage() {
  return <MarketplaceClient />;
}
