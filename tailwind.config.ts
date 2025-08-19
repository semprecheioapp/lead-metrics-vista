import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          50: "#eff6ff",
          100: "#dbeafe", 
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          foreground: "#ffffff",
          dark: "hsl(var(--primary-dark))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "#1e293b",
          foreground: "#3b82f6",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "#ffffff",
          light: "hsl(var(--success-light))",
          glow: "hsl(var(--success-glow))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "#000000",
          light: "hsl(var(--warning-light))",
          glow: "hsl(var(--warning-glow))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "#ffffff", 
          light: "hsl(var(--danger-light))",
          glow: "hsl(var(--danger-glow))",
        },
        neutral: {
          DEFAULT: "hsl(var(--neutral))",
          foreground: "#ffffff",
        },
        purple: {
          DEFAULT: "hsl(var(--purple-accent))",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        pacifico: ["Pacifico", "cursive"],
        inter: ["Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        button: "8px",
      },
      backgroundImage: {
        "corporate-gradient":
          "linear-gradient(135deg,#1e3a8a 0%,#1e40af 25%,#3b82f6 50%,#1e40af 75%,#1e3a8a 100%)",
        "primary-gradient": 
          "linear-gradient(135deg,#1e40af 0%,#3b82f6 50%,#60a5fa 100%)",
        "success-gradient":
          "linear-gradient(135deg,#059669 0%,#10b981 50%,#34d399 100%)",
        "warning-gradient":
          "linear-gradient(135deg,#d97706 0%,#f59e0b 50%,#fbbf24 100%)",
      },
      boxShadow: {
        neon: "0 0 30px 6px rgba(59,130,246,0.55)",
        "neon-blue": "0 0 20px 4px rgba(59,130,246,0.4), 0 0 40px 8px rgba(59,130,246,0.2)",
        "corporate-glow": "0 4px 14px 0 rgba(59,130,246,0.3), inset 0 1px 0 0 rgba(59,130,246,0.4)",
        "success-glow": "0 0 20px 4px rgba(16,185,129,0.4)",
        "warning-glow": "0 0 20px 4px rgba(245,158,11,0.4)",
        "danger-glow": "0 0 20px 4px rgba(239,68,68,0.4)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up":   { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "shimmer-slide":  { to: { transform: "translate(calc(100cqw - 100%), 0)" } },
        "spin-around": {
          "0%": { transform: "translateZ(0) rotate(0)" },
          "15%, 35%": { transform: "translateZ(0) rotate(90deg)" },
          "65%, 85%": { transform: "translateZ(0) rotate(270deg)" },
          "100%": { transform: "translateZ(0) rotate(360deg)" },
        },
        rippling: { "0%": { transform: "scale(0)", opacity: "1" }, "100%": { transform: "scale(4)", opacity: "0" } },
        "shiny-text": { "0%": { backgroundPosition: "0% 0%" }, "100%": { backgroundPosition: "100% 100%" } },
        "border-beam": { "100%": { transform: "rotate(1turn)" } },
        grid: { "0%": { transform: "translateY(-50%)" }, "100%": { transform: "translateY(-60%)" } },
        "fade-in": { "0%": { opacity: "0", transform: "translateY(10px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "slide-up": { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "pulse-glow": { "0%, 100%": { boxShadow: "0 0 20px rgba(59,130,246,0.3)" }, "50%": { boxShadow: "0 0 30px rgba(59,130,246,0.6)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shimmer-slide": "shimmer-slide var(--speed) ease-in-out infinite alternate",
        "spin-around": "spin-around calc(var(--speed) * 2) infinite linear",
        rippling: "rippling 0.6s linear forwards",
        "shiny-text": "shiny-text 1s linear infinite",
        "border-beam": "border-beam var(--border-beam-duration) infinite linear",
        grid: "grid 15s linear infinite",
        "fade-in": "fade-in 0.4s ease-out",
        "slide-up": "slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "pulse-glow": "pulse-glow 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
