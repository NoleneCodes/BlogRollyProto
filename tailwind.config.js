
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand primary colors
        primary: '#c42142',
        primaryDark: '#ff4d6d',
        
        // Dark mode backgrounds
        backgroundDark: '#121212',
        backgroundDarkAlt: '#1a1a1a',
        cardDark: '#1f1f1f',
        cardDarkAlt: '#262626',
        
        // Dark mode hero
        heroDark: '#2c0f14',
        
        // Text colors
        textDark: '#E4E4E7',
        textDarkSecondary: '#A1A1AA',
        
        // Border/outline colors
        borderDark: '#374151',
        borderDarkLight: '#4B5563',
      },
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#c42142',
        secondary: '#a01835',
      },
    },
  },
  plugins: [],
}
