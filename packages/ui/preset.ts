import type { Config } from "tailwindcss";
import { brand, ink, surface, semantic } from "./src/tokens";

/** Preset Tailwind compartido con la identidad iTech. */
const preset = {
  theme: {
    extend: {
      colors: {
        brand,
        primary: brand[500],
        "primary-deep": brand[600],
        celeste: brand[300],
        ink,
        surface,
        success: semantic.success,
        danger: semantic.danger,
        warning: semantic.warning,
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 6px 24px -8px rgba(0, 87, 173, 0.18)",
        card: "0 2px 12px -4px rgba(13, 38, 77, 0.10)",
      },
      backgroundImage: {
        "brand-gradient": `linear-gradient(120deg, ${brand[300]} 0%, ${brand[500]} 55%, ${brand[600]} 100%)`,
      },
    },
  },
} satisfies Partial<Config>;

export default preset;
