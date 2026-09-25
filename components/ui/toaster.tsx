import type { CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/** The shadcn/ui Sonner wrapper, reading the theme from the cookie instead of next-themes. */
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-center"
      style={
        {
          "--normal-bg": "var(--surface)",
          "--normal-text": "var(--text)",
          "--normal-border": "var(--border)",
        } as CSSProperties
      }
      {...props}
    />
  );
}
