import * as React from "react";
import { cn } from "../cn";

/** Logo iTech servido desde /public/images/logo.webp de cada app. */
export function Logo({
  className,
  height = 40,
}: {
  className?: string;
  height?: number;
}) {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src="/images/logo.webp"
      alt="iTech import"
      height={height}
      style={{ height }}
      className={cn("w-auto", className)}
    />
  );
}
