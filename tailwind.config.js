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
        theme: {
          // 70% White Canvas & Surfaces
          canvas: 'var(--theme-canvas)',
          surface: 'var(--theme-surface)',
          'surface-subtle': 'var(--theme-surface-subtle)',
          'surface-muted': 'var(--theme-surface-muted)',
          border: 'var(--theme-border)',
          'border-strong': 'var(--theme-border-strong)',

          // Typography Ink
          ink: 'var(--theme-ink)',
          muted: 'var(--theme-ink-muted)',
          subtle: 'var(--theme-ink-subtle)',

          // 20% Deep Charcoal Black
          'dark-deep': 'var(--theme-dark-deep)',
          dark: 'var(--theme-dark)',
          'dark-surface': 'var(--theme-dark-surface)',
          'dark-border': 'var(--theme-dark-border)',
          'dark-muted': 'var(--theme-dark-muted)',

          // 10% Crimson Red
          accent: 'var(--theme-accent)',
          'accent-hover': 'var(--theme-accent-hover)',
          'accent-active': 'var(--theme-accent-active)',
          'accent-soft': 'var(--theme-accent-soft)',
          'accent-border': 'var(--theme-accent-border)',
          'accent-text': 'var(--theme-accent-text)',

          // Legacy Compatibility Bindings
          forest: 'var(--theme-dark-surface)',
          coral: 'var(--theme-accent)',
          'coral-hover': 'var(--theme-accent-hover)',
          sand: 'var(--theme-surface-subtle)',
          cream: 'var(--theme-surface-subtle)',
        },

        // Direct fallback aliases so legacy classes keep rendering properly
        forest: {
          950: 'var(--theme-dark)',
          900: 'var(--theme-dark-surface)',
          800: '#272B30',
          700: '#383D45',
        },
        gold: {
          600: 'var(--theme-accent-hover)',
          500: 'var(--theme-accent)',
          400: 'var(--theme-accent)',
          300: '#FCA5A5',
          100: 'var(--theme-accent-soft)',
        },
        paper: {
          DEFAULT: 'var(--theme-canvas)',
          canvas: 'var(--theme-canvas)',
          cream: 'var(--theme-surface-subtle)',
          surface: 'var(--theme-surface)',
          border: 'var(--theme-border)',
        },
        ink: {
          DEFAULT: 'var(--theme-ink)',
          muted: 'var(--theme-ink-muted)',
          subtle: 'var(--theme-ink-subtle)',
        },
        brand: {
          green: 'var(--theme-dark)',
          'green-hover': 'var(--theme-dark-surface)',
          gold: 'var(--theme-accent)',
          cream: 'var(--theme-surface-subtle)',
        },
      },
      fontFamily: {
        poster: ['"Bebas Neue"', 'Oswald', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};