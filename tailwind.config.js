/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        // Theme variables bridge
        theme: {
          dark: 'var(--theme-dark)',
          forest: 'var(--theme-forest)',
          coral: 'var(--theme-coral)',
          'coral-hover': 'var(--theme-coral-hover)',
          sand: 'var(--theme-sand)',
          canvas: 'var(--theme-canvas)',
          surface: 'var(--theme-surface)',
          cream: 'var(--theme-cream)',
          border: 'var(--theme-border)',
          'border-strong': 'var(--theme-border-strong)',
          ink: 'var(--theme-ink)',
          muted: 'var(--theme-ink-muted)',
          subtle: 'var(--theme-ink-subtle)',
        },

        // 20% Charcoal mapped to existing forest classes
        forest: {
          950: '#111315', // Core deep charcoal
          900: '#1A1D20', // Elevated charcoal surface
          800: '#272B30', // Charcoal borders & subtle dark states
          700: '#383D45',
        },

        // 10% Crimson Red mapped to existing gold & accent classes
        gold: {
          600: '#B91C1C',
          500: '#DC2626',
          400: '#E50914',
          300: '#FCA5A5',
          100: '#FEF2F2',
        },

        // 70% White / Soft White mapped to existing paper classes
        paper: {
          DEFAULT: '#FFFFFF',
          canvas: '#FFFFFF',
          cream: '#F8F9FA',
          surface: '#FFFFFF',
          border: '#E5E7EB',
        },

        ink: {
          DEFAULT: '#14171A',
          muted: '#656F7D',
          subtle: '#9AA2AD',
        },

        // Heals the 148+ unregistered brand-* classes without template rewrites
        brand: {
          green: '#111315',          // Maps to Charcoal
          'green-hover': '#1A1D20',
          gold: '#E50914',           // Maps to Crimson Red
          cream: '#F8F9FA',          // Maps to Clean White/Soft Gray
        },
      },
      fontFamily: {
        poster: ['"Bebas Neue"', 'Oswald', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        book: '-2px 0 6px -1px rgba(0, 0, 0, 0.10), 3px 6px 18px -2px rgba(17, 19, 21, 0.12)',
        'book-hover': '-3px 0 10px -1px rgba(0, 0, 0, 0.12), 6px 14px 28px -3px rgba(17, 19, 21, 0.18)',
        card: '0 2px 8px -1px rgba(17, 19, 21, 0.05), 0 1px 3px -1px rgba(17, 19, 21, 0.03)',
      },
    },
  },
  plugins: [],
};