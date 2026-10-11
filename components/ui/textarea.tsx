import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-cyber-border bg-cyber-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition-all focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple/50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
