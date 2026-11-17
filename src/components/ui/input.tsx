import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md border border-border bg-card-2 px-3 body-6 text-foreground placeholder:text-muted-2 transition-colors focus-visible:border-accent/60 aria-[invalid=true]:border-danger/70",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
