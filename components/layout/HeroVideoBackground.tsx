"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hero background clips, played one after another and looped forever.
 * Files live in /public/videos and are served with a 1-year immutable
 * Cache-Control header (see next.config.ts).
 *
 * When you REPLACE a file's contents without renaming it, bump
 * VIDEO_VERSION so every visitor's browser fetches the new copy.
 */
const VIDEO_VERSION = "1";

export const HERO_VIDEOS = [
  "/videos/hero-penthouse.mp4",
  "/videos/hero-gamer.mp4",
  "/videos/hero-retro-arcade.mp4",
  "/videos/hero-studio.mp4",
] as const;

/** Crossfade length between clips. */
const FADE_MS = 800;

const withVersion = (src: string) => `${src}?v=${VIDEO_VERSION}`;

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

function shouldPlayVideo() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (conn?.saveData) return false;
  if (conn?.effectiveType && /(^|-)2g$/.test(conn.effectiveType)) return false;
  return true;
}

/**
 * Two stacked <video> elements: one plays while the other preloads the next
 * clip. Shortly before the current clip ends we start the next one and
 * crossfade, which avoids the black flash of swapping `src` on one element.
 */
export default function HeroVideoBackground({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const slotA = useRef<HTMLVideoElement>(null);
  const slotB = useRef<HTMLVideoElement>(null);

  const [enabled, setEnabled] = useState(false);
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0);

  // Mutable playback state (doesn't need re-renders).
  const state = useRef({
    active: 0 as 0 | 1,
    clip: 0, // index into HERO_VIDEOS for the active slot
    switching: false,
    visible: true,
  });

  useEffect(() => {
    setEnabled(shouldPlayVideo());
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const slots = [slotA.current, slotB.current] as const;
    const [first, second] = slots;
    if (!first || !second) return;

    const total: number = HERO_VIDEOS.length;
    const s = state.current;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const safePlay = (v: HTMLVideoElement) => {
      v.play().catch(() => {
        /* Autoplay blocked (e.g. iOS Low Power Mode): poster/background stays. */
      });
    };

    const load = (v: HTMLVideoElement, clip: number) => {
      v.src = withVersion(HERO_VIDEOS[clip % total]);
      v.load();
    };

    const advance = () => {
      if (s.switching || total < 2) return;
      s.switching = true;

      const from = s.active;
      const to = (1 - from) as 0 | 1;
      const next = slots[to]!;

      next.currentTime = 0;
      if (s.visible) safePlay(next);

      s.active = to;
      s.clip = (s.clip + 1) % total;
      setActiveSlot(to);

      // Once the fade finishes, stop the old clip and preload the one after.
      timers.push(
        setTimeout(() => {
          const old = slots[from]!;
          old.pause();
          load(old, s.clip + 1);
          s.switching = false;
        }, FADE_MS),
      );
    };

    const onTimeUpdate = (e: Event) => {
      const v = e.currentTarget as HTMLVideoElement;
      if (v !== slots[s.active] || !v.duration) return;
      if (v.duration - v.currentTime <= FADE_MS / 1000) advance();
    };
    const onEnded = (e: Event) => {
      if (e.currentTarget === slots[s.active]) advance();
    };

    // Start the next clip downloading only after the first one is playing,
    // so it never competes for bandwidth with what the visitor sees first.
    const onFirstPlaying = () => {
      if (total > 1 && !second.src) load(second, 1);
    };

    for (const v of slots) {
      v!.addEventListener("timeupdate", onTimeUpdate);
      v!.addEventListener("ended", onEnded);
    }
    first.addEventListener("playing", onFirstPlaying, { once: true });

    if (total === 1) first.loop = true;
    load(first, 0);
    safePlay(first);

    // Pause when the hero is off-screen or the tab is hidden (saves battery & data on mobile).
    const syncPlayback = () => {
      const v = slots[s.active]!;
      if (s.visible && !document.hidden) safePlay(v);
      else v.pause();
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        s.visible = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.05 },
    );
    if (containerRef.current) io.observe(containerRef.current);
    document.addEventListener("visibilitychange", syncPlayback);

    return () => {
      timers.forEach(clearTimeout);
      io.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      first.removeEventListener("playing", onFirstPlaying);
      for (const v of slots) {
        v!.removeEventListener("timeupdate", onTimeUpdate);
        v!.removeEventListener("ended", onEnded);
        v!.pause();
      }
    };
  }, [enabled]);

  if (!enabled) return null;

  const videoClass =
    "absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out";

  return (
    <div ref={containerRef} className={`absolute inset-0 ${className}`} aria-hidden="true">
      {[slotA, slotB].map((ref, i) => (
        <video
          key={i}
          ref={ref}
          className={videoClass}
          style={{
            opacity: activeSlot === i ? 1 : 0,
            transitionDuration: `${FADE_MS}ms`,
          }}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
        />
      ))}
    </div>
  );
}
