import type { Config } from "tailwindcss";
import preset from "@itech/ui/preset";

export default {
  presets: [preset],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
} satisfies Config;
