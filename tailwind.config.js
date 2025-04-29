/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
 './src/**/*.{html,ts}'
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['"Open Sans"', 'sans-serif']          
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease',
        'fade-out': 'fade-out 0.4s ease'
      }
      },
    },
    
    plugins: [require('@tailwindcss/line-clamp')],
  };
  