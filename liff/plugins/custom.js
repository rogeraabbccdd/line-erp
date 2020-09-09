import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import zhHant from 'vuetify/es5/locale/zh-Hant'
import BarcodeIcon from '@/components/BarcodeIcon.vue'

Vue.use(Vuetify)

export default new Vuetify({
  icons: {
    values: {
      barcode: {
        component: BarcodeIcon
      }
    }
  },
  lang: {
    locales: { zhHant },
    current: 'zhHant'
  }
})
