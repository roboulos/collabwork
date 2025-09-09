import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-200",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "bg-muted text-muted-foreground border border-border hover:bg-muted/70 dark:border-border-strong",
        destructive:
          "bg-red-100 text-red-700 border border-red-200 hover:bg-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-900",
        outline: 
          "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        success:
          "bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900 dark:hover:bg-emerald-900",
        warning:
          "bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900 dark:hover:bg-amber-900",
        info:
          "bg-sky-100 text-sky-700 border border-sky-200 hover:bg-sky-200 dark:bg-sky-950 dark:text-sky-400 dark:border-sky-900 dark:hover:bg-sky-900",
        purple:
          "bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-900 dark:hover:bg-purple-900",
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