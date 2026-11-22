import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    className?: string;
};

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    actionHref,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center text-center gap-3 py-14 px-6",
                className,
            )}
        >
            <div className="p-3 rounded-2xl bg-neon-purple/10 text-neon-purple">
                <Icon className="w-7 h-7" aria-hidden="true" />
            </div>
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
            {actionLabel && actionHref && (
                <Button asChild size="sm" className="mt-2">
                    <Link href={actionHref}>{actionLabel}</Link>
                </Button>
            )}
        </div>
    );
}