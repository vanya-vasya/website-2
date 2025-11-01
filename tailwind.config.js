/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  safelist: [
    // Profession button colors (text)
    'text-violet-400',
    'text-violet-300',
    'text-pink-400',
    'text-pink-300',
    'text-blue-400',
    'text-blue-300',
    'text-emerald-400',
    'text-emerald-300',
    // Profession button backgrounds & borders
    'bg-violet-900/20',
    'bg-pink-900/20',
    'bg-blue-900/20',
    'bg-emerald-900/20',
    'border-violet-500/20',
    'border-pink-500/20',
    'border-blue-500/20',
    'border-emerald-500/20',
    // Ring colors used for active state highlighting
    'ring-violet-400',
    'ring-pink-400',
    'ring-blue-400',
    'ring-emerald-400',
    
    // Tool card colors - violet (Video Creators)
    'bg-violet-600/10',
    'bg-violet-600/5',
    'bg-violet-600/20',
    'bg-violet-500/10',
    'bg-violet-500/5',
    'bg-violet-500/20',
    'text-violet-600',
    'text-violet-500',
    'border-violet-400/30',
    'border-violet-500/30',
    
    // Tool card colors - pink/rose (Digital Artists)
    'bg-pink-600/10',
    'bg-pink-500/10',
    'bg-rose-600/10',
    'bg-rose-500/10',
    'text-pink-600',
    'text-pink-500',
    'text-rose-600',
    'text-rose-500',
    
    // Tool card colors - blue/indigo (Musicians)
    'bg-blue-600/10',
    'bg-blue-500/10',
    'bg-blue-400/10',
    'bg-indigo-600/10',
    'bg-indigo-500/10',
    'text-blue-600',
    'text-blue-500',
    'text-blue-400',
    'text-indigo-600',
    'text-indigo-500',

    // Tool card colors - green/emerald/teal (Content Creators)
    'bg-green-600/10',
    'bg-green-500/10',
    'bg-emerald-600/10',
    'bg-emerald-500/10',
    'bg-teal-600/10',
    'text-green-600',
    'text-green-500',
    'text-emerald-600',
    'text-emerald-500',
    'text-teal-600'
  ],
  theme: {
    container: {
      center: true,
      // padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        heading: ['var(--font-heading)', 'Space Grotesk', 'Inter', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      transitionDuration: {
        '2000': '2000ms',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "collapsible-down": {
          from: { height: 0 },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: 0 },
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        "fade-out": {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        "slide-in": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-out": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "collapsible-down": "collapsible-down 0.2s ease-out",
        "collapsible-up": "collapsible-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-out",
        "slide-in": "slide-in 0.2s ease-out",
        "slide-out": "slide-out 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}