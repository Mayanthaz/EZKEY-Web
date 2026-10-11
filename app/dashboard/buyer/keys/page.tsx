"use client";

import { Key, Eye, EyeOff, Copy, CheckCircle2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const gameKeys = [
  {
    id: "1",
    title: "Cyberpunk 2077 Ultimate Edition",
    key: "CYBER-2077-A9F2-K891-PL03",
    platform: "Steam",
    purchasedAt: "Jul 7, 2026",
    activated: true,
  },
  {
    id: "2",
    title: "Elden Ring Shadow of the Erdtree DLC",
    key: "ELDEN-RING-77B2-MM89-QQ12",
    platform: "Steam",
    purchasedAt: "Jul 6, 2026",
    activated: false,
  },
  {
    id: "3",
    title: "Xbox Game Pass Ultimate — 12 Months",
    key: "XGPU-12M0-99X4-WW55-TT88",
    platform: "Xbox",
    purchasedAt: "Jun 28, 2026",
    activated: true,
  },
];

export default function BuyerKeysPage() {
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

  const toggleReveal = (id: string) => {
    const next = new Set(revealedKeys);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setRevealedKeys(next);
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("License key copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">My Digital Keys Vault</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Permanent library of all your purchased activation licenses and redeem codes.
        </p>
      </div>

      <div className="grid gap-4">
        {gameKeys.map((item) => {
          const isRevealed = revealedKeys.has(item.id);
          const maskedKey = item.key.replace(
            /([A-Z0-9]+)-([A-Z0-9]+)-([A-Z0-9]+)-([A-Z0-9]+)/,
            "$1-••••-••••-$4"
          );

          return (
            <div
              key={item.id}
              className="glass-card p-5 sm:p-6 space-y-4 hover:border-cyber-border transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">
                      {item.platform}
                    </span>
                    <span>•</span>
                    <span>Purchased on {item.purchasedAt}</span>
                  </div>
                </div>

                <Badge
                  variant={item.activated ? "default" : "secondary"}
                  className="w-fit text-[10px] font-bold uppercase tracking-wider"
                >
                  {item.activated ? "Redeemed / Activated" : "Ready to Redeem"}
                </Badge>
              </div>

              {/* Key Box */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-cyber-surface/70 border border-cyber-border rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-neon-purple/10 text-neon-purple">
                    <Key className="w-4 h-4" />
                  </div>
                  <code className="text-sm font-mono tracking-wider text-foreground font-semibold">
                    {isRevealed ? item.key : maskedKey}
                  </code>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleReveal(item.id)}
                    className="text-xs h-8 text-muted-foreground hover:text-foreground"
                  >
                    {isRevealed ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 mr-1" /> Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 mr-1" /> Reveal Key
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => copyKey(item.key)}
                    className="text-xs h-8 bg-neon-green text-black hover:bg-neon-green/90 font-bold"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
