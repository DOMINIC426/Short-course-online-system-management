// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "udom-primary": "#0066cc",
        "udom-primary-dark": "#002483",
        "udom-accent": "#f7941d",
      },
      /* Custom keyframe definitions for smooth horizontal scrolling */
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      /* Utility animation class mapping: animate-marquee */
      animation: {
        marquee: "marquee 18s linear infinite",
      },
    },
  },
  plugins: [],
};