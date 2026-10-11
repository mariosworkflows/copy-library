import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Helvetica Now Var", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
      },
      colors: {
        wf: {
          canvas:  "#F7F7F7",
          surface: "#FFFFFF",
          ink:     "#0C0D0E",
          lime:    "#E0FC04",
          muted:   "#6B787A",
          subtle:  "#F1F3F3",
          border:  "#E7E9E9",
        },
      },
    },
  },
  plugins: [],
};

export default config;
