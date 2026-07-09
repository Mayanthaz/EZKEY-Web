"use client";

import { Key, Eye, EyeOff, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";

const gameKeys = [
  { id: "1", title: "Cyberpunk 2077 Ultimate Edition", key: "CYBER-2077-XXXX-YYYY-ZZZZ", platform: "Steam", purchasedAt: "Jul 7, 2026", activated: true },
  { id: "2", title: "Elden Ring Shadow of the Erdtree DLC", key: "ELDEN-RING-XXXX-YYYY-ZZZZ", platform: "Steam", purchasedAt: "Jul 6, 2026", activated: false },
  { id: "3", title: "Xbox Game Pass Ultimate — 12 Months", key: "XGPU-12M0-XXXX-YYYY-ZZZZ", platform: "Xbox", purchasedAt: "Jun 28, 2026", activated: true },
];

export default function BuyerKeysPage() {
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleReveal = (id: string) => {
    const next = new Set(revealedKeys);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setRevealedKeys(next);
  };

  const copyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">My Digital Keys</h1>
        <p className="text-sm text-muted-foreground mt-1">Your purchased digital keys library</p>
      </div>

      <div className="space-y-3">
        {gameKeys.map((item) => (
          <div key={item.id} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{item.platform}</span>
                  <span>•</span>
                  <span>{item.purchasedAt}</span>
                </div>
              </div>
              {item.activated ? (
                <span className="badge-success flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Activated
                </span>
              ) : (
                <span className="badge-info">Not Activated</span>
              )}
            </div>

            <div className="flex items-center gap-2 p-3 bg-cyber-surface/50 border border-cyber-border/50 rounded-xl">
              <Key className="w-4 h-4 text-neon-purple shrink-0" />
              <code className="flex-1 text-sm font-mono tracking-wider">
                {revealedKeys.has(item.id)
                  ? item.key
                  : "••••-••••-••••-••••-••••"}
              </code>
              <button
                onClick={() => toggleReveal(item.id)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded transition-all"
                title={revealedKeys.has(item.id) ? "Hide" : "Reveal"}
              >
                {revealedKeys.has(item.id) ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => copyKey(item.id, item.key)}
                className="p-1.5 text-muted-foreground hover:text-neon-green rounded transition-all"
                title="Copy key"
              >
                {copiedKey === item.id ? (
                  <CheckCircle className="w-4 h-4 text-neon-green" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
