import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-plus-jakarta-sans)', 'sans-serif'],
        serif: ['var(--font-playfair-display)', 'serif'],
      },
      colors: {
        primary: 'hsl(var(--bg-primary))',
        secondary: 'hsl(var(--bg-secondary))',
        'text-primary': 'hsl(var(--text-primary))',
        'text-secondary': 'hsl(var(--text-secondary))',
        accent: 'hsl(var(--accent))',
        'accent-secondary': 'hsl(var(--accent-secondary))',
        'glass-bg': 'rgba(var(--glass-bg))',
        'glass-border': 'rgba(var(--glass-border))'
      },
      backdropBlur: {
        xl: '24px',
      },
      animation: {
        'subtle-blob': 'subtle-blob 15s infinite alternate',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        'subtle-blob': {
          '0%': { transform: 'translate(0px, 0px) scale(1)', opacity: 0.15 },
          '50%': { transform: 'translate(50px, -80px) scale(1.4)', opacity: 0.05 },
          '100%': { transform: 'translate(-20px, 20px) scale(0.8)', opacity: 0.1 },
        },
        'fade-in-up': {
            'from': { opacity: '0', transform: 'translateY(1rem)' },
            'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
            'from': { transform: 'translateX(100%)' },
            'to': { transform: 'translateX(0)' },
        }
      },
    },
  },
  plugins: [],
}
export default config
