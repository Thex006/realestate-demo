"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer relative inline-flex h-6 w-11 after:absolute after:-inset-x-1 after:-inset-y-2.5 after:content-[''] shrink-0 cursor-pointer items-center rounded-full border border-border-strong bg-white/10 transition-colors data-[state=checked]:bg-accent",
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="pointer-events-none block size-[18px] translate-x-[2px] rounded-full bg-foreground transition-transform duration-200 data-[state=checked]:translate-x-[22px] data-[state=checked]:bg-accent-ink" />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";
