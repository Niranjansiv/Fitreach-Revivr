/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cyan: { DEFAULT: '#00d4ff', dark: '#0099cc' },
        violet: { DEFAULT: '#8b5cf6', dark: '#6d28d9' },
        dark: {
          50: '#1e1e3a',
          100: '#161630',
          200: '#101028',
          300: '#0c0c1d',
          400: '#080816',
          500: '#060611',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        'serif-accent': ['"Playfair Display"', 'serif'],
      },
      animation: {
        'pulse-cyan': 'pulseCyan 2s infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        float: 'float 3s ease-in-out infinite',
        'bounce-dot': 'bounceDot 0.6s ease-in-out infinite',
      },
      keyframes: {
        pulseCyan: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(0,212,255,0.3)' },
          '50%': { opacity: '0.7', boxShadow: '0 0 40px rgba(0,212,255,0.6)' },
        },
        slideIn: {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        bounceDot: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
