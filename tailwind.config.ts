import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // 1. ชุดสี (Color Palette)
      colors: {
        background: "#020617", // slate-950 (Main Dark)
        surface: "#0f172a",    // slate-900 (Card/Section)
        border: "#1e293b",     // slate-800 (Lines)
        
        // Brand Colors
        primary: {
          DEFAULT: "#38bdf8",  // sky-400
          foreground: "#0f172a",
          glow: "rgba(56, 189, 248, 0.5)",
        },
        secondary: {
          DEFAULT: "#a855f7",  // purple-500
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#f43f5e",  // rose-500
          foreground: "#ffffff",
        },
        
        // Status Colors
        success: "#22c55e",    // green-500
        warning: "#eab308",    // yellow-500
        error: "#ef4444",      // red-500
      },

      // 2. พื้นหลังพิเศษ (Background Images)
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "grid-white": "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.05)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")",
        "dot-white": "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='16' height='16' fill='none'%3e%3ccircle fill='rgb(255 255 255 / 0.05)' cx='10' cy='10' r='1.6257413380501518'/%3e%3c/svg%3e\")",
      },

      // 3. อนิเมชั่น (Animations)
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "marquee": "marquee 25s linear infinite",
        "shimmer": "shimmer 2s linear infinite",
        "gradient-x": "gradient-x 15s ease infinite",
        "float": "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },

      // 4. คีย์เฟรม (Keyframes)
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "gradient-x": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 20px rgba(56, 189, 248, 0.5)" },
          "50%": { opacity: ".5", boxShadow: "0 0 10px rgba(56, 189, 248, 0.2)" },
        }
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),   // จัดหน้าบทความสวยๆ (prose)
    require("@tailwindcss/forms"),        // ฟอร์มสวยงาม
    require("@tailwindcss/aspect-ratio"), // จัดสัดส่วนรูปภาพ/วิดีโอ
  ],
};

export default config;