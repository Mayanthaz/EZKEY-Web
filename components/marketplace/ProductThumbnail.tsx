"use client";

import { useState } from "react";
import { Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductThumbnailProps {
  src?: string | null;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
}

export function ProductThumbnail({
  src,
  alt,
  className,
  containerClassName,
  priority = false,
}: ProductThumbnailProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // If no source is provided or image errored out
  if (!src || hasError) {
    return (
      <div
        className={cn(
          "w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-cyber-card via-cyber-surface to-cyber-dark text-cyber-border/60 select-none p-4",
          containerClassName
        )}
      >
        <Gamepad2 className="w-12 h-12 text-cyber-border/50 group-hover:text-neon-purple/40 transition-colors duration-500 mb-2" />
        <span className="text-[11px] text-muted-foreground/60 text-center line-clamp-1 max-w-[80%] font-medium">
          {alt}
        </span>
      </div>
    );
  }

  // Derive WebP alternative if available
  const webpSrc = src.endsWith(".jpg") ? src.replace(/\.jpg$/, ".webp") : null;

  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden bg-gradient-to-br from-cyber-card to-cyber-surface",
        containerClassName
      )}
    >
      {/* Subtle loader shimmer before image renders */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-cyber-card/80 animate-pulse flex items-center justify-center">
          <Gamepad2 className="w-8 h-8 text-cyber-border/30" />
        </div>
      )}

      <picture>
        {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={cn(
            "w-full h-full object-cover transition-all duration-500",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
        />
      </picture>
    </div>
  );
}
