import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f2f5',
          100: '#d9dfe8',
          200: '#b3bfd1',
          300: '#8d9fba',
          400: '#677fa3',
          500: '#273351',
          600: '#1f2841',
          700: '#1a2338',
          800: '#141c2d',
          900: '#0f1522',
          DEFAULT: '#273351',
        },
        accent: {
          blue: '#1e40af',
          red: '#dc2626',
          gold: '#d97706',
        },
        // MOYD brand colors
        moyd: {
          'blue-light': '#5B9FBD',
          'blue-dark': '#3D7A94',
          'banner': '#A9CCE1',
          'navy': '#273351',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'system-ui', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px 0 rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 25px 0 rgba(0, 0, 0, 0.12)',
        'large': '0 10px 40px 0 rgba(0, 0, 0, 0.15)',
        'header': '0px 12px 12px 0px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
};
export default config;
