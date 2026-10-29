/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          terracota: '#B85324',
          'terracota-dark': '#9A421A',
          'terracota-light': '#CE6A3B',
          cafe: '#4A2013',
          'cafe-dark': '#32150C',
          'cafe-light': '#663223',
          creme: '#F9E8B8',
          'creme-light': '#FDF6E3',
          bg: '#FAF6EE',
          surface: '#FFFFFF',
        },
        andon: {
          green: '#2D7A4C',
          'green-bg': '#E8F5EE',
          amber: '#D97706',
          'amber-bg': '#FEF3C7',
          wine: '#991B1B',
          'wine-bg': '#FEE2E2',
        },
      },
      fontFamily: {
        brand: ['Cinzel', 'Playfair Display', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'soft-warm': '0 4px 20px -2px rgba(74, 32, 19, 0.08), 0 2px 6px -1px rgba(184, 83, 36, 0.05)',
        'elevated-warm': '0 10px 25px -3px rgba(74, 32, 19, 0.12), 0 4px 10px -2px rgba(184, 83, 36, 0.08)',
        'touch-active': '0 2px 8px rgba(184, 83, 36, 0.3)',
      },
    },
  },
  plugins: [],
};
