/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'bounce': 'bounce 1s infinite',
        'shake': 'shake 0.5s ease infinite',
        'pop-in': 'popIn 0.5s ease',
        'winner': 'winner 0.8s ease infinite',
        'spin': 'spin 1s linear infinite',
      },
      keyframes: {
        bounce: {
          '0%, 20%, 50%, 80%, 100%': {
            transform: 'translateY(0)',
          },
          '40%': {
            transform: 'translateY(-20px)',
          },
          '60%': {
            transform: 'translateY(-10px)',
          },
        },
        shake: {
          '0%, 100%': {
            transform: 'translateX(0)',
          },
          '25%': {
            transform: 'translateX(-5px)',
          },
          '75%': {
            transform: 'translateX(5px)',
          },
        },
        popIn: {
          '0%': {
            transform: 'scale(0)',
          },
          '80%': {
            transform: 'scale(1.1)',
          },
          '100%': {
            transform: 'scale(1)',
          },
        },
        winner: {
          '0%, 100%': {
            transform: 'scale(1)',
          },
          '50%': {
            transform: 'scale(1.2)',
          },
        },
      },
    },
  },
  plugins: [],
} 