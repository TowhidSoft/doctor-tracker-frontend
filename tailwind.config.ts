import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["var(--font-inter)"],
        roboto: ["Roboto", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#2558B3", // Logo blue
          dark: "#1B4187",
          light: "#E8EEFB",
        },
        secondary: {
          DEFAULT: "#1E293B", // Slate 800 (dark UI chrome, unrelated to logo)
          dark: "#0F172A",
          light: "#334155",
        },
        teal: {
          DEFAULT: "#2BAE90", // Logo teal/green
          dark: "#1F8A72",
          light: "#E4F6F2",
        },
        accent: {
          DEFAULT: "#F5821F", // Orange CTA — distinct from logo gradient for contrast
          dark: "#D66C0F",
        },
        danger: {
          DEFAULT: "#FF6B6B",
        },
        success: {
          DEFAULT: "#3ECF8E",
        },
        background: {
          DEFAULT: "#F8FAFC", // Clean slate-50
          white: "#FFFFFF",
        },
        text: {
          primary: "#1F1F1F",
          secondary: "#64748B", // Slate 500
          light: "#94A3B8",
        },
      },
      screens: {
        xs: "540px",
      },
      container: {
        padding: "1rem",
        center: true,
        screens: {
          DEFAULT: "1400px",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in forwards",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [],
} satisfies Config;