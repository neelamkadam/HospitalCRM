const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");
const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");
const medistryColor = "#01576A"

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        "bg-input": "hsl(210°, 6%, 34%)",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#0a0a0a",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        medistryColor:{
          DEFAULT: medistryColor
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
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
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
        roboto: ["Roboto", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        blink: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.3 },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 oklch(60% 0.118 184.704)' },
          '100%': { transform: 'scale(1.05)', boxShadow: '0 0 0 10px rgba(13, 148, 136, 0)' },
        },
        ping: {
          '0%': { transform: 'scale(0.9)', opacity: '1' },
          '70%': { transform: 'scale(1.4)', opacity: '0.6' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        popIn: {
          '0%': { transform: 'scale(0.7)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        l5: {
          '0%': {
            boxShadow: '20px 0 #9CA3AF, -20px 0 rgba(156, 163, 175, 0.2)',
            background: '#9CA3AF',
          },
          '33%': {
            boxShadow: '20px 0 #9CA3AF, -20px 0 rgba(156, 163, 175, 0.2)',
            background: 'rgba(156, 163, 175, 0.2)',
          },
          '66%': {
            boxShadow: '20px 0 rgba(156, 163, 175, 0.2), -20px 0 #9CA3AF',
            background: 'rgba(156, 163, 175, 0.2)',
          },
          '100%': {
            boxShadow: '20px 0 rgba(156, 163, 175, 0.2), -20px 0 #9CA3AF',
            background: '#9CA3AF',
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        blink: "blink 1s infinite",
        pulse: 'pulse 6s infinite',
        ping: 'ping 1.2s infinite',
        popIn: 'popIn 0.5s ease-out',
        l5: 'l5 1s infinite linear alternate',
      },
      // Add custom scrollbar styles
      scrollbarWidth: {
        thin: "thin",
      },
      scrollbarColors: {
        DEFAULT: {
          thumb: "#3b82f6", // blue-500
          track: "#e5e7eb", // gray-300
        },
      },
      screens: {
        ipad: {
          raw: '(min-device-width: 768px) and (max-device-width: 1366px) and (-webkit-min-device-pixel-ratio: 1)',
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("tailwind-scrollbar"),
    addVariablesForColors, // Custom plugin to generate CSS variables
  ],
};

// Custom Plugin to Generate CSS Variables for Colors
function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}
