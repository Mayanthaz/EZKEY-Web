/**
 * EZKEY brand mark — a key glyph on a gradient tile.
 *
 * Replaces the generic game-controller icon that was used site-wide. The key
 * shape reads as "digital keys" at a glance, which is what the marketplace
 * actually sells, and the gradient matches the purple → cyan accent language
 * used in `text-gradient` / `btn-neon`.
 */
export default function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-[10px] ${className}`}
      style={{ aspectRatio: "1 / 1" }}
    >
      <span
        className="absolute inset-0 rounded-[10px]"
        style={{
          background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 45%, #22d3ee 100%)",
        }}
      />
      {/* Hairline top highlight keeps the tile from looking flat on black */}
      <span className="absolute inset-0 rounded-[10px] shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]" />
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative w-[58%] h-[58%] drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
        aria-hidden="true"
      >
        <circle cx="8" cy="8.5" r="3.6" />
        <path d="M10.6 11.1 20 20.5" />
        <path d="M16.2 16.7l2.1-2.1" />
        <path d="M18.4 18.9l1.8-1.8" />
      </svg>
      <span className="sr-only">EZKEY</span>
    </span>
  );
}
