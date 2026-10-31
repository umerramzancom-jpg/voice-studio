import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#111213", surface: "#191b1d", raised: "#212427", line: "#2b2f33",
        ink: "#e8eaec", mute: "#8b9399", accent: { DEFAULT: "#34d399", dim: "#0f3d2e" },
      },
      borderRadius: { xl2: "1.25rem" },
    },
  },
  plugins: [],
};
export default config;
