/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // If you're using React (TS or JS)
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      fontWeight: {
        regular: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
      },
      colors: {
        background: {
          primary: "#FAF9F6",
          secondary: "#F3F4ED",
        },
        surface: "#FFFFFF",
        text: {
          primary: "#292C27",
          secondary: "#777F6D",
          muted: "#9DA491",
        },
        accent: {
          primary: "#CB5A35",
          glow: "#CB5A3520",
        },
        border: {
          muted: "#E3E6DA",
        },
      },
      letterSpacing: {
        wide: "0.05em",
        wider: "0.1em",
        widest: "0.15em",
      },
      animation: {
        "fade-in": "fadeIn 0.8s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "slide-in-left": "slideInLeft 0.7s ease-out",
        glow: "glow 2s ease-in-out infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "spin-slow": "spin 20s linear infinite",
        "reverse-spin-slow": "reverseSpin 15s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        glow: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255, 106, 0, 0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(255, 106, 0, 0.4)" },
        },
        reverseSpin: {
          "0%": { transform: "rotate(360deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
      },
    },
  },
  plugins: [],
};
