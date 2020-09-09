<template lang="pug">
  #item-in
    div(v-if="inited")
      h1.text-center 進貨
      br
      v-text-field(clearable no-data-text="找不到資料" v-model="search" :items="scanned" rounded filled placeholder="搜尋商品..." prepend-inner-icon="search")
      v-container
        v-row(align="center")
          v-col(cols="12")
            v-data-table(:items="scanned" :headers="headers" :search="search" multi-sort)
              template(v-slot:item.actions='{ item }')
                v-icon.mr-2(small @click="plus(item)") add
                v-icon.mr-2(small @click="minus(item)") remove
            v-btn.my-4(block color="success" dark @click="send" :disabled="sent") 送出
    //- Scanner
    v-dialog(v-model="scanner" width="500")
      v-card
        v-card-title.headline 掃描條碼
        Scanner(@decode="decode" v-if="scanner" :stop="false")
        v-divider
        v-card-actions
          v-spacer
          v-btn(color="error" text @click="scanner = false") 關閉
          v-spacer
    v-btn(fixed fab right bottom dark color="cyan" @click="scanner = true")
      v-icon $barcode
</template>

<script>
import Scanner from '~/components/Scanner.vue'

export default {
  components: {
    Scanner
  },
  data () {
    return {
      inited: false,
      scanner: false,
      items: [],
      scanned: [],
      search: '',
      headers: [
        { text: '品名', value: 'name' },
        { text: '數量', value: 'scanned' },
        { text: '操作', value: 'actions', sortable: false }
      ],
      alert: {
        show: false,
        text: '',
        type: ''
      },
      sent: false
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
          return item
        })
        this.inited = true
        this.overlay.show = false
      } catch (error) {
        this.$swal.fire({
          type: 'error',
          title: '錯誤',
          text: '系統錯誤'
        }).then(() => {
          this.liff.closeWindow()
        })
      }
    },
    decode (data) {
      // is item exists
      const itemIdx = this.items.findIndex((item) => {
        return item.code === data
      })
      if (itemIdx >= 0) {
        const scannedIdx = this.scanned.findIndex((item) => {
          return item.code === data
        })
        if (scannedIdx >= 0) {
          this.scanned[scannedIdx].scanned++
        } else {
          this.scanned.push({ ...this.items[itemIdx], scanned: 1 })
        }
        console.log(this.scanned)
      } else {
        this.alert.type = 'error'
        this.alert.show = true
        this.alert.text = '不存在的品項'
      }
    },
    async send () {
      this.sent = true
      try {
        const items = this.scanned.map((item) => {
          const data = {}
          data.quantity = item.history[item.history.length - 1].quantity + item.scanned
          data.cost = item.history[item.history.length - 1].cost
          data.price = item.history[item.history.length - 1].price
          data.code = item.code
          data.diff = item.scanned
          return data
        })
        await this.$axios.patch('/items/history', { action: 2, items })
        this.$swal.fire({
          type: 'success',
          title: '成功',
          text: '進貨成功'
        }).then(() => {
          this.liff.sendMessages([
            {
              type: 'text',
              text: `已於${new Date().toLocaleDateString()}完成進貨`
            }
          ])
            .finally(() => {
              this.liff.closeWindow()
            })
        })
      } catch (error) {
        this.$swal.fire({
          type: 'error',
          title: '錯誤',
          text: '系統錯誤'
        })
      }
      this.sent = false
    },
    plus (item) {
      const idx = this.scanned.indexOf(item)
      this.scanned[idx].scanned++
    },
    minus (item) {
      const idx = this.scanned.indexOf(item)
      this.scanned[idx].scanned--
      if (this.scanned[idx].scanned <= 0) {
        this.scanned.splice(idx, 1)
      }
    }
  },
  head () {
    return {
      title: '易RP - 進貨作業'
    }
  }
}
</script>
