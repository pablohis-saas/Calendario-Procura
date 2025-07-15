/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        primary: {
          50: 'rgb(var(--primary) / 0.05)',
          100: 'rgb(var(--primary) / 0.1)',
          200: 'rgb(var(--primary) / 0.2)',
          300: 'rgb(var(--primary) / 0.3)',
          400: 'rgb(var(--primary) / 0.4)',
          500: 'rgb(var(--primary) / 0.5)',
          600: 'rgb(var(--primary) / 0.6)',
          700: 'rgb(var(--primary) / 0.7)',
          800: 'rgb(var(--primary) / 0.8)',
          900: 'rgb(var(--primary) / 0.9)',
        },
        secondary: {
          50: 'rgb(var(--secondary) / 0.05)',
          100: 'rgb(var(--secondary) / 0.1)',
          200: 'rgb(var(--secondary) / 0.2)',
          400: 'rgb(var(--secondary) / 0.4)',
          700: 'rgb(var(--secondary-foreground) / 0.7)',
        },
        accent: {
          50: 'rgb(var(--accent) / 0.05)',
          100: 'rgb(var(--accent) / 0.1)',
          400: 'rgb(var(--accent) / 0.4)',
          600: 'rgb(var(--accent) / 0.6)',
        },
        danger: {
          50: 'rgb(var(--destructive) / 0.05)',
          100: 'rgb(var(--destructive) / 0.1)',
          400: 'rgb(var(--destructive) / 0.4)',
          600: 'rgb(var(--destructive) / 0.6)',
        },
        warning: {
          50: '#fffbe6',
          100: '#fff3bf',
          400: '#ffe066',
          600: '#ffd43b',
        },
        card: 'rgb(var(--card) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        'muted-foreground': 'rgb(var(--muted-foreground) / <alpha-value>)',
        brand: {
          DEFAULT: '#1b2538',
        },
      },
      borderRadius: {
        xl: 'var(--radius)',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} 