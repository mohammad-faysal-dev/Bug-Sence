import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-sky-500/30 bg-sky-500/15 text-sky-300",
        secondary:
          "border-slate-700 bg-slate-800 text-slate-300",
        destructive:
          "border-red-500/30 bg-red-500/15 text-red-400",
        outline:
          "border-slate-700 bg-transparent text-slate-300",
        cyan:
          "border-cyan-500/40 bg-cyan-500/15 text-cyan-300",
        blue:
          "border-blue-500/40 bg-blue-500/15 text-blue-300",
        emerald:
          "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
        amber:
          "border-amber-500/40 bg-amber-500/15 text-amber-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
