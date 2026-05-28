export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  future: { compatibilityVersion: 4 },
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
    apiSportsKey: process.env.API_SPORTS_KEY,
  },
})
