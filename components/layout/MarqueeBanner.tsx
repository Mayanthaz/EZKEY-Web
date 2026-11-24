import { Sparkle } from "lucide-react";

const PRIMARY_ITEMS: { label: string; accent: boolean }[] = [
  { label: "UNDER DEVELOPMENT", accent: false },
  { label: "UNDER DEVELOPMENT", accent: true },
  { label: "DEVELOPMENT UNDERWAY", accent: false },
  { label: "UNDER DEVELOPMENT", accent: true },
];

const SECONDARY_ITEMS: string[] = [
  "Go grab a cofee",
  "24/7 LIVE SUPPORT",
  "Go grab a cofee",
  "ZERO HIDDEN FEES",
];

// Repeat the base set a few times so the track is always wider than the
// viewport, then duplicate the whole sequence once more so the marquee can
// loop seamlessly with a plain -50% transform.
function buildTrack<T>(items: T[], repeat = 4) {
  const base = Array.from({ length: repeat }).flatMap(() => items);
  return [...base, ...base];
}

export default function MarqueeBanner() {
  const rowOne = buildTrack(PRIMARY_ITEMS);
  const rowTwo = buildTrack(SECONDARY_ITEMS);

  return (
    <section
      className="relative overflow-hidden bg-cyber-dark py-12 sm:py-16"
      aria-hidden="true"
    >
      <div className="relative -rotate-1 sm:-rotate-2 w-[130%] -ml-[15%] sm:w-[120%] sm:-ml-[10%]">
        {/* Row 1 — bold headline band, scrolling left */}
        <div className="group relative flex overflow-hidden border-y border-red-500/40 bg-gradient-to-r from-red-950 via-red-900/80 to-red-950 py-4 sm:py-5 shadow-[0_20px_50px_-24px_rgba(220,38,38,0.55)]">
          <div className="flex shrink-0 animate-marquee-left items-center group-hover:[animation-play-state:paused] motion-reduce:animate-none">
            {rowOne.map((item, i) => (
              <div
                key={`primary-${i}`}
                className="flex shrink-0 items-center gap-6 px-6 sm:gap-10 sm:px-10"
              >
                <span
                  className={`font-display whitespace-nowrap text-2xl font-black uppercase tracking-tight sm:text-3xl md:text-4xl ${item.accent ? "text-red-400" : "text-foreground"
                    }`}
                >
                  {item.label}
                </span>
                <Sparkle className="h-4 w-4 shrink-0 text-red-400/80 sm:h-5 sm:w-5" />
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 — fine-print ticker, scrolling right */}
        <div className="group relative -mt-px flex overflow-hidden border-b border-red-500/40 bg-red-950/90 py-3 sm:py-3.5">
          <div className="flex shrink-0 animate-marquee-right items-center group-hover:[animation-play-state:paused] motion-reduce:animate-none">
            {rowTwo.map((label, i) => (
              <div
                key={`secondary-${i}`}
                className="flex shrink-0 items-center gap-4 px-4 sm:gap-6 sm:px-6"
              >
                <span className="whitespace-nowrap font-mono text-xs uppercase tracking-[0.25em] text-red-200/80 sm:text-sm">
                  {label}
                </span>
                <span className="font-mono text-xs tracking-widest text-red-400/40 sm:text-sm">
                  {"///"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edge fades so the diagonal bands dissolve into the page rather than
          cutting off abruptly at the viewport edge. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-cyber-dark to-transparent sm:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-cyber-dark to-transparent sm:w-28" />
    </section>
  );
}
