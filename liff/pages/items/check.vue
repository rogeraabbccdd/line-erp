<template lang="pug">
  #items
    div(v-if="inited")
      h1.text-center 商品盤點
      br
      v-text-field(clearable no-data-text="找不到資料" v-model="search" :items="items" rounded filled placeholder="搜尋商品..." prepend-inner-icon="search" background-color="grey darken-3")
      v-container
        v-row(align="center")
          //- v-col(cols="6" md="3" v-for="(item, index) in filtered" :key="index")
          //-   v-card(color="grey darken-3")
          //-     v-img.align-end(height="150px" :src="getAssetsUrl(item.image)")
          //-     v-card-title {{ item.name }}
          //-     v-card-text(:class="{'orange--text': item.checked > item.quantity, 'light-green--text': item.quantity === item.checked, 'red--text': item.checked < item.quantity}")
          //-       | 庫存: {{ item.quantity }}
          //-       | 已點: {{ item.checked }}
          //-     v-card-actions
          //-       v-spacer
          //-       span
          //-       v-btn(icon @click="item.checked++")
          //-         v-icon add
          //-       v-btn(icon @click="item.checked > 0 ? item.checked-- : item.checked = 0")
          //-         v-icon remove
          //-       v-btn(icon @click="info(item)")
          //-         v-icon info
          v-col(cols="12")
            v-data-table(:items="filtered" :headers="headers" :search="search" multi-sort)
              template(v-slot:item.actions='{ item }')
                v-icon.mr-2(small @click="item.checked++") add
                v-icon.mr-2(small @click="item.checked > 0 ? item.checked-- : item.checked = 0") remove
                v-icon.mr-2(small @click="info(item)") info
              template(v-slot:item.checked='{ item }')
                span(:class="{'orange--text': item.checked > item.quantity, 'light-green--text': item.quantity === item.checked, 'red--text': item.checked < item.quantity}")
                  | {{ item.checked }}
          v-col(cols="12")
            p.text-center(v-if="filtered.length === 0") 沒有符合搜尋的資料
          v-col(cols="12")
            v-btn.my-4(block color="success" dark @click="send") 結束盤點
      v-dialog(v-model="chart.show" width="500")
        apexchart(width="500" type="line" :options="chart.options" :series="chart.series")
      v-btn(fixed fab right bottom dark color="cyan" @click="scanner = true")
        v-icon $barcode
      //- Scanner
      v-dialog(v-model="scanner" width="500")
        v-card
          v-card-title.headline 掃描條碼
          Scanner(@decode="decode" v-if="scanner" :stop="alert.show")
          v-divider
          v-card-actions
            v-spacer
            v-btn(color="error" text @click="scanner = false") 關閉
            v-spacer
      //- Alert
      Alert(:alert="alert")
      //- Item dialog
      ItemDialog(:data="dialog" v-if="dialog.show")
      //- Finish dialog
      v-dialog(v-model="finish.show" width="500")
        v-card
          v-card-title.headline 盤點結束
          v-card-text(v-if="finish.incorrect > 0")
            | {{ finish.incorrect }} 項商品的數量不正確，請再檢查一次
            ul
              li(v-for="(item, index) in items" v-if="item.checked != item.history[item.history.length-1].quantity")
                | {{ item.name }} : {{ item.checked }} / {{ item.history[item.history.length-1].quantity }}
          v-card-text(v-else) 商品數量正確
          v-divider.my-3.success(style="opacity: 0.22")
          v-card-actions
            v-spacer
            v-btn.mx-4(color="red" @click="finish.show = false" text) 取消
            v-btn.mx-4(color="green" @click="exit" text :disabled="sent") 結束盤點
            v-spacer
</template>

<script>
import Alert from '~/components/Alert.vue'
import Scanner from '~/components/Scanner.vue'

export default {
  components: {
    Scanner,
    Alert
  },
  data () {
    return {
      inited: false,
      items: [],
      search: '',
      chart: {
        show: false,
        options: {
          type: 'line'
        },
        series: []
      },
      dial: {
        fab: false,
        transition: 'slide-y-reverse-transition'
      },
      scanner: false,
      alert: {
        show: false,
        text: '',
        type: ''
      },
      finish: {
        show: false,
        missing: 0
      },
      dialog: {
        show: false,
        data: {
          storage: '',
          code: 0,
          history: [
            {
              quantity: 0,
              cost: 0,
              price: 0
            }
          ]
        }
      },
      sent: false,
      headers: [
        { text: '品名', value: 'name' },
        { text: '庫存', value: 'quantity' },
        { text: '已點', value: 'checked' },
        { text: '操作', value: 'actions', sortable: false }
      ]
    }
  },
  computed: {
    liff () {
      return this.$store.getters.liff
    },
    profile: {
      get () {
        return this.$store.getters.profile
      },
      set (value) {
        this.$store.commit('profile', value)
      }
    },
    overlay: {
      get () {
        return this.$store.getters.overlay
      },
      set (value) {
        this.$store.commit('overlay', value)
      }
    },
    _id () {
      return this.$route.params.id
    },
    filtered () {
      const search = this.search || ''
      return this.items.filter((item) => {
        return item.name.toUpperCase().includes(search.toUpperCase())
      })
    }
  },
  watch: {
    profile: {
      handler (newValue, oldValue) {
        if (oldValue.role === -2) {
          if (newValue.role >= 0) {
            this.init()
          } else {
            this.$swal.fire({
              type: 'error',
              title: '錯誤',
              text: '沒有使用這個功能的權限'
            }).then(() => {
              this.liff.closeWindow()
            })
          }
        }
      },
      deep: true
    }
  },
  mounted () {
    if (this.profile.role >= 0) {
      this.init()
    }
  },
  methods: {
    async init () {
      try {
        const response = await this.$axios.get('/items')
        this.items = response.data.result.map((item) => {
          item.value = item.name
          item.text = item.name
          item.quantity = item.history[item.history.length - 1].quantity
          item.cost = item.history[item.history.length - 1].cost
          item.price = item.history[item.history.length - 1].price
          item.checked = 0
          return item
        })
        this.inited = true
        this.overlay.show = false
      } catch (error) {
        if (error.response.status !== 404) {
          this.$swal.fire({
            type: 'error',
            title: '錯誤',
            text: '系統錯誤'
          }).then(() => {
            this.liff.closeWindow()
          })
        } else {
          this.inited = true
          this.overlay.show = false
        }
      }
    },
    getAssetsUrl (file) {
      return this.$axios.defaults.baseURL + '/assets/' + file
    },
    decode (data) {
      const index = this.items.findIndex((item) => {
        return item.code === data
      })
      if (index >= 0) {
        this.items[index].checked++
      } else {
        this.alert.type = 'error'
        this.alert.show = true
        this.alert.text = '不存在的品項'
      }
    },
    send () {
      let incorrect = 0
      for (const item of this.items) {
        if (item.checked < item.history[item.history.length - 1].quantity) {
          incorrect++
        }
      }
      this.finish.show = true
      this.finish.incorrect = incorrect
    },
    async exit () {
      this.sent = true
      try {
        const item = this.items.map((item) => {
          item.diff = item.checked - item.quantity
          item.quantity = item.checked
        })
        await this.$axios.patch('/items/history', { action: 4, item })
        this.liff.sendMessages([
          {
            type: 'text',
            text: `已於${new Date().toLocaleDateString()}完成盤點`
          }
        ])
        this.liff.closeWindow()
      } catch (error) {
        this.$swal.fire({
          type: 'error',
          title: '錯誤',
          text: '系統錯誤'
        })
      }
      this.sent = false
    },
    info (data) {
      this.dialog.item = data
      this.dialog.show = true
    }
  },
  head () {
    return {
      title: '易RP - 盤點作業'
    }
  }
}
</script>
