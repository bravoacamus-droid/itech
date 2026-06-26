import * as React from "react";
import { cn } from "../cn";

type Variant = "primary" | "outline" | "ghost" | "soft";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary: "bg-brand-500 text-white hover:bg-brand-600 shadow-soft",
  outline: "border border-brand-200 text-brand-600 hover:bg-brand-50",
  ghost: "text-brand-600 hover:bg-brand-50",
  soft: "bg-brand-50 text-brand-600 hover:bg-brand-100",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-300 disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
