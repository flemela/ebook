// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-01-15',
  devtools: { enabled: false },

  devServer: {
    port: 3333,
    host: '0.0.0.0',
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  css: [
    '~/assets/css/main.css',
  ],

  runtimeConfig: {
    sokoApiBaseUrl: process.env.SOKO_API_BASE_URL || 'http://localhost:3000/api/v1',
    sokoOrgApiKey: process.env.SOKO_ORG_API_KEY || '',
    adminEmail: process.env.FLEMELA_ADMIN_EMAIL || 'admin@ebookreads.org',
    public: {
      storeSlug: process.env.NUXT_PUBLIC_STORE_SLUG || 'flemela',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://www.ebookreads.org',
      siteName: 'EbookReads',
    },
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'en', // Broad English for global reach
      },
      title: 'EbookReads — Download PDF eBooks & Bestsellers Globally',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#111315' },
        {
          name: 'description',
          content: 'Discover handpicked bestsellers, finance, business, psychology, and classic literature eBooks. Instant, worldwide digital PDF downloads at EbookReads.',
        },
        { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        { name: 'googlebot', content: 'index, follow' },
        { name: 'author', content: 'EbookReads' },
        { name: 'publisher', content: 'EbookReads' },
        { property: 'og:site_name', content: 'EbookReads' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:url', content: 'https://www.ebookreads.org' },
        { property: 'og:title', content: 'EbookReads — Global Digital Bookstore' },
        { property: 'og:description', content: 'Download bestselling eBooks instantly in PDF format across finance, self-help, and literature.' },
        { property: 'og:image', content: 'https://www.ebookreads.org/images/hero-cover.jpg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'EbookReads Library' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'EbookReads — Global Digital Bookstore' },
        { name: 'twitter:description', content: 'Download bestselling eBooks instantly in PDF format across finance, self-help, and literature.' },
        { name: 'twitter:image', content: 'https://www.ebookreads.org/images/hero-cover.jpg' },
      ],
      link: [
        { rel: 'canonical', href: 'https://www.ebookreads.org' },
        { rel: 'alternate', hreflang: 'en', href: 'https://www.ebookreads.org' },
        { rel: 'alternate', hreflang: 'x-default', href: 'https://www.ebookreads.org' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;700&display=swap',
        },
      ],
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },
});