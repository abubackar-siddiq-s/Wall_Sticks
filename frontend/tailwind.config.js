/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#FFD000',
          gold: '#D9B200',
          accent: '#F1C40F',
          black: '#0A0A0A',
          white: '#FFFFFF',
          ink: '#161616',
          smoke: '#F7F7F5'
        }
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        xl2: '1.75rem',
        xl3: '2.5rem'
      },
      boxShadow: {
        soft: '0 8px 30px rgba(0,0,0,0.06)',
        card: '0 12px 40px rgba(0,0,0,0.08)',
        glow: '0 0 0 1px rgba(255,208,0,0.4), 0 20px 60px rgba(255,208,0,0.25)'
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
        shimmer: { '0%': { backgroundPosition: '-500px 0' }, '100%': { backgroundPosition: '500px 0' } }
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite'
      }
    },
  },
  plugins: [],
}
