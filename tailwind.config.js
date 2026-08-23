/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        civic: {
          blue:    '#1A3A6B',
          blueMid: '#2B5199',
          blueLight: '#EEF3FB',
        },
        saffron: {
          DEFAULT: '#FF6B00',
          light:   '#FFF3EB',
        },
        success: '#16A34A',
        danger:  '#DC2626',
        warning: '#D97706',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
