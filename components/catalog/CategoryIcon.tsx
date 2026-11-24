import {
  KeyRound,
  Smartphone,
  Ticket,
  CreditCard,
  UserRound,
  Rocket,
  Tag,
  type LucideIcon,
} from "lucide-react";

/**
 * Category glyphs.
 *
 * Categories were rendered as raw emoji (🔑 📱 🎟️ …), which sit at an
 * inconsistent size/baseline against the lucide iconography used everywhere
 * else and render differently per platform. This maps each category slug to a
 * lucide icon so the whole UI shares one icon language.
 */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "digital-keys": KeyRound,
  "digital-apps": Smartphone,
  vouchers: Ticket,
  "digital-credits": CreditCard,
  accounts: UserRound,
  "digital-services": Rocket,
};

export function getCategoryIcon(slug?: string): LucideIcon {
  if (!slug) return Tag;
  return CATEGORY_ICONS[slug] ?? Tag;
}

export default function CategoryIcon({
  slug,
  name,
  className,
}: {
  slug?: string;
  /** Optional name, only used for the accessible label. */
  name?: string;
  className?: string;
}) {
  const Icon = getCategoryIcon(slug);
  return (
    <span
      className={`inline-flex items-center justify-center ${className ?? ""}`}
      role={name ? "img" : undefined}
      aria-label={name}
      aria-hidden={name ? undefined : true}
    >
      <Icon className="h-full w-full" strokeWidth={1.75} />
    </span>
  );
}
