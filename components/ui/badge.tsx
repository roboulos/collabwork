import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-200 hover:scale-105",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 dark:bg-primary/15 dark:hover:bg-primary/25",
        secondary:
          "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 dark:bg-destructive/15 dark:hover:bg-destructive/25",
        outline: 
          "border border-border text-foreground hover:bg-accent hover:text-accent-foreground",
        success:
          "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 hover:bg-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:hover:bg-emerald-500/25",
        warning:
          "bg-amber-500/10 text-amber-700 border border-amber-500/20 hover:bg-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:hover:bg-amber-500/25",
        info:
          "bg-sky-500/10 text-sky-700 border border-sky-500/20 hover:bg-sky-500/20 dark:bg-sky-500/15 dark:text-sky-400 dark:hover:bg-sky-500/25",
        purple:
          "bg-purple-500/10 text-purple-700 border border-purple-500/20 hover:bg-purple-500/20 dark:bg-purple-500/15 dark:text-purple-400 dark:hover:bg-purple-500/25",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }