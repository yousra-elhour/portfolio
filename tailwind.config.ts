import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
         '900': '900px',
        '1200': '1200px',
        '1400': '1400px',
        '1600': '1600px',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },

      fontFamily: {
        lead: ["var(--font-pixelify)", "monospace"], // Use Pixelify Sans for hero sections
        sans: ["var(--font-sans)", "Montserrat", "Arial", "sans-serif"], // Montserrat as default
        title: ["var(--font-title)", "serif"], // Marcellus SC for elegant titles
        pixelify: ["var(--font-pixelify)", "monospace"], // Pixelify Sans alias
        bhavuka: ["var(--font-bhavuka)", "serif"], // Keep Bhavuka available if needed
      },
      
      keyframes: {
        equalizer: {
          '0%, 100%': { height: '20%' },
          '50%': { height: '100%' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        equalizer: 'equalizer 0.8s ease-in-out infinite',
        fadeIn: 'fadeIn 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
};
export default config;
