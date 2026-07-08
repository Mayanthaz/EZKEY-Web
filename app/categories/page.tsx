import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MOCK_CATEGORIES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse all categories on EZKEY — Game Keys, In-Game Items, Gift Cards, Game Coins, Accounts, and Boosting Services.",
};

export default function CategoriesPage() {
  return (
    <div className="pt-24 pb-20 bg-cyber-dark min-h-screen">
      <div className="section-container">
        <div className="mb-12">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
            All <span className="text-gradient">Categories</span>
          </h1>
          <p className="text-muted-foreground">
            Browse our marketplace by category
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_CATEGORIES.map((cat, i) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="glass-card p-8 group transition-all duration-500 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl transition-transform duration-500 group-hover:scale-110">
                  {cat.icon}
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-neon-purple transition-all duration-300 group-hover:translate-x-1" />
              </div>
              <h2 className="font-display text-lg font-bold mb-2 group-hover:text-neon-purple transition-colors">
                {cat.name}
              </h2>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {cat.description}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-cyber-border">
                <span className="text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">
                    {cat.count.toLocaleString()}
                  </span>{" "}
                  listings
                </span>
                <span className="text-xs text-neon-purple font-medium group-hover:text-neon-blue transition-colors">
                  Browse →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
