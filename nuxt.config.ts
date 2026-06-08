export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  future: { compatibilityVersion: 4 },
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxt/ui', '@nuxtjs/supabase'],
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/login', '/confirm'],
    },
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
  colorMode: { preference: 'system' },
  runtimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    footballDataApiKey: process.env.FOOTBALL_DATA_API_KEY,
  },
})
