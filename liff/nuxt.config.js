const dev = process.env.NODE_ENV.trim() === 'dev'
module.exports = {
  telemetry: false,
  dev,
  devtools: dev,
  vue: {
    config: {
      devtools: dev,
      productionTip: dev,
      silent: !dev,
      performance: dev
    }
  },
  router: {
    base: '/liff/'
  },
  srcDir: 'liff/',
  buildDir: 'liff/.nuxt',
  /*
  ** Nuxt rendering mode
  ** See https://nuxtjs.org/api/configuration-mode
  */
  mode: 'universal',
  /*
  ** Nuxt target
  ** See https://nuxtjs.org/api/configuration-target
  */
  target: 'server',
  /*
  ** Headers of the page
  ** See https://nuxtjs.org/api/configuration-head
  */
  head: {
    titleTemplate: '%s',
    title: '易RP',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC&display=swap' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Two+Tone|Material+Icons+Round|Material+Icons+Sharp' }
    ],
    script: [
      { src: 'https://static.line-scdn.net/liff/edge/versions/2.3.1/sdk.js' }
    ]
  },
  /*
  ** Global CSS
  */
  css: [
    { src: 'vue-img-inputer/dist/index.css' }
  ],
  /*
  ** Plugins to load before mounting the App
  ** https://nuxtjs.org/guide/plugins
  */
  plugins: [
    { src: '@/plugins/vue-barcode-reader', ssr: false },
    { src: '@/plugins/vue-img-inputer', ssr: false },
    { src: '@/plugins/vconsole', ssr: false },
    { src: '@/plugins/vue-apexcharts', ssr: false },
    { src: '@/plugins/vue-underscore', ssr: false },
    { src: '@/plugins/vue-moment', ssr: false },
    { src: '@/plugins/custom' }
  ],
  /*
  ** Auto import components
  ** See https://nuxtjs.org/api/configuration-components
  */
  components: true,
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    '@nuxtjs/vuetify'
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    'nuxt-sweetalert2'
  ],
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
    baseURL: process.env.URL_SERVICE + '/api',
    headers: {
      common: {
        'Content-Type': 'application/json;charset=utf-8'
      }
    },
    credentials: true
  },
  /*
  ** vuetify module configuration
  ** https://github.com/nuxt-community/vuetify-module
  */
  vuetify: {
    defaultAssets: {
      icons: 'md'
    },
    customVariables: ['@/assets/variables.scss'],
    treeShake: true,
    options: {
      customProperties: true
    },
    theme: {
      dark: true
      // themes: {
      //   dark: {
      //     primary: colors.blue.darken2,
      //     accent: colors.grey.darken3,
      //     secondary: colors.amber.darken3,
      //     info: colors.teal.lighten1,
      //     warning: colors.amber.base,
      //     error: colors.deepOrange.accent4,
      //     success: colors.green.accent3
      //   }
      // }
    }
  },
  /*
  ** Build configuration
  ** See https://nuxtjs.org/api/configuration-build/
  */
  build: {
    extend (config, ctx) {
      config.module.rules.push({
        test: /\.(ogg|mp3|wav|mpe?g)$/i,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]'
        }
      })
    }
  },
  env: {
    CHANNEL_LIFF: process.env.CHANNEL_LIFF,
    NODE_ENV: process.env.NODE_ENV
  }
}
