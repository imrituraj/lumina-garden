/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        zen: {
          dark: "#0F172A", // Deep teal/slate base
          primary: "#14B8A6", // Teal
          secondary: "#10B981", // Soft Green
          accent: "#F59E0B", // Glowing Amber
          card: "rgba(255, 255, 255, 0.05)", // Ultra-clear glass
        }
      },
      backdropBlur: {
        xs: '2px',
        '2xl': '40px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
        'glass-inset': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
        'glow': '0 0 20px rgba(20, 184, 166, 0.4)',
        'btn': '0 8px 20px rgba(20, 184, 166, 0.3)',
        'btn-hover': '0 12px 25px rgba(20, 184, 166, 0.4)',
      }
    },
  },
  plugins: [],
}
