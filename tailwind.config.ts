import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },

      fontFamily: {
        lead: ["var(--font-bhavuka)"],
        sans: ["Monsterrat", "Arial", "sans-serif"],
        title: ["var(--font-title)"],
        pixelify: ["var(--font-pixelify)"],
      },
      
      animation: {
        'float-slow': 'float-slow 15s ease-in-out infinite',
        'float-medium': 'float-medium 18s ease-in-out infinite',
        'float-fast': 'float-fast 12s ease-in-out infinite',
      },
      
      keyframes: {
        'float-slow': {
          '0%, 100%': {
            transform: 'translateX(-60px) translateY(0px) scale(1.15)',
          },
          '50%': {
            transform: 'translateX(60px) translateY(-30px) scale(1.15)',
          },
        },
        'float-medium': {
          '0%, 100%': {
            transform: 'translateX(-80px) translateY(-15px) scale(1.2)',
          },
          '50%': {
            transform: 'translateX(80px) translateY(15px) scale(1.2)',
          },
        },
        'float-fast': {
          '0%, 100%': {
            transform: 'translateX(-100px) translateY(0px) scale(1.25)',
          },
          '50%': {
            transform: 'translateX(100px) translateY(-40px) scale(1.25)',
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
