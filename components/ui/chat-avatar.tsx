"use client";

import { useState } from "react";

export type AvatarStatus = "online" | "offline";

interface ChatAvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  status?: AvatarStatus;
  unread?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<ChatAvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-11 w-11 text-sm",
};

const STATUS_DOT_SIZE: Record<NonNullable<ChatAvatarProps["size"]>, string> = {
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
};

const UNREAD_DOT_SIZE: Record<NonNullable<ChatAvatarProps["size"]>, string> = {
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-2.5 w-2.5",
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Avatar for chat surfaces: shows a real profile photo when available and
 * falls back to a gradient initials badge if the image fails to load. Can
 * optionally overlay an online/offline presence dot and an unread-message
 * indicator dot.
 */
export function ChatAvatar({
  src,
  name,
  size = "md",
  status,
  unread = false,
  className = "",
}: ChatAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(src) && !imgError;

  return (
    <div className={`relative shrink-0 ${className}`}>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          className={`${SIZE_CLASSES[size]} rounded-full object-cover ring-1 ring-white/10`}
        />
      ) : (
        <div
          className={`${SIZE_CLASSES[size]} flex items-center justify-center rounded-full bg-gradient-to-br from-neon-purple to-neon-blue font-bold text-white ring-1 ring-white/10`}
        >
          {getInitials(name)}
        </div>
      )}

      {/* Unread indicator */}
      {unread && (
        <span
          className={`absolute -top-0.5 -right-0.5 ${UNREAD_DOT_SIZE[size]} rounded-full bg-neon-purple ring-2 ring-cyber-darker animate-pulse`}
          aria-label="Unread messages"
        />
      )}

      {/* Online / offline presence */}
      {status && (
        <span
          className={`absolute bottom-0 right-0 ${STATUS_DOT_SIZE[size]} rounded-full ring-2 ring-cyber-darker ${
            status === "online" ? "bg-neon-green" : "bg-muted-foreground/60"
          }`}
          aria-label={status === "online" ? "Online" : "Offline"}
        />
      )}
    </div>
  );
}
