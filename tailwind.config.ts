export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'dot-pulse': 'dotPulse 1.5s steps(3, end) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        dotPulse: {
          '0%': { content: "'.'" },
          '33%': { content: "'..'" },
          '66%': { content: "'...'" },
          '100%': { content: "'.'" },
        },
      },
    },
  },
  plugins: [],
};
