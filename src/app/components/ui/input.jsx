import * as React from "react";

import { cn } from "@/lib/utils";

function Input({
  className,
  type = "text",
  multiline = false, 
  rows = 2, 
  ...props
}) {
  const sharedBase =
    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

  const focusAndInvalid =
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";

  if (multiline) {
    return (
      <textarea
        data-slot="input"
        rows={rows}
        className={cn(
          `${sharedBase} px-3 py-3 leading-relaxed min-h-[8rem] md:text-base`,
          focusAndInvalid,
          className
        )}
        {...props}
      />
    );
  }

  return (
    <input
      type={type}
      data-slot="input"
      required
      className={cn(
        `${sharedBase} h-10 px-3 py-1 text-base md:text-sm`,
        focusAndInvalid,
        className
      )}
      {...props}
    />
  );
}

export { Input };
