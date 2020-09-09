<template lang="pug">
  #items
    div(v-if="inited")
      h1.text-center 商品
      br
      v-text-field(clearable no-data-text="找不到資料" v-model="search" :items="items" rounded filled placeholder="搜尋商品..." prepend-inner-icon="search" background-color="grey darken-3")
      v-container
        v-row(align="center")
          //- v-col(cols="6" md="3" v-for="(item, index) in filtered" :key="index")
          //-   v-card(color="grey darken-3")
          //-     v-img.align-end(height="150px" :src="getAssetsUrl(item.image)")
          //-     v-card-title {{ item.name }}
          //-     v-card-text(:class="{'orange--text': item.history[item.history.length-1].quantity === 0}")
          //-       | 庫存: {{ item.history[item.history.length-1].quantity }}
          //-       | 本月銷售: {{ item.sells }}
          //-     v-card-actions
          //-       v-spacer
          //-       span
          //-       v-btn(icon @click="info(item)")
          //-         v-icon info
          //-       v-btn(icon @click="edit(item)")
          //-         v-icon edit
          v-col(cols="12")
            v-data-table(:items="items" :headers="headers" :search="search" multi-sort)
              template(v-slot:item.actions='{ item }')
                v-icon.mr-2(small @click="info(item)") info
                v-icon.mr-2(small @click="edit(item)") edit
              template(v-slot:item.quantity='{ item }')
                | {{ item.history[item.history.length-1].quantity }}
          v-col(cols="12")
            p.text-center(v-if="filtered.length === 0") 沒有符合搜尋的資料
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
      //- Edit item
      v-dialog(v-model="dialogEdit.show" v-if="dialogEdit.show")
        v-form(ref="editform" v-model="dialogEdit.valid")
          v-card
            v-card-title.headline 編輯 {{ dialogEdit.title }}
            v-card-text
              v-container
                v-row
                  v-col(cols="12")
                    v-text-field(v-model="dialogEdit.data.name" label="品名" required :rules="[rules.required]")
                  v-col(cols="12")
                    v-text-field(v-model.number="dialogEdit.data.price" label="銷售價" required :rules="[rules.required, rules.price]")
                  v-col(cols="12")
                    v-text-field(v-model.number="dialogEdit.data.cost" label="成本價" required :rules="[rules.required, rules.price]")
                  v-col(cols="12")
                    v-text-field(v-model="dialogEdit.data.storage" label="存放區" required :rules="[rules.required]")
                  v-col(cols="12")
                    v-text-field(v-model.number="dialogEdit.data.quantity" label="數量" required :rules="[rules.number]")
            v-divider
            v-card-actions
              v-spacer
              v-btn(color="error" text @click="dialogEdit.show = false") 取消
              v-btn(color="success" text @click="saveEdit") 保存
      //- Item dialog
      ItemDialog(:data="dialog" v-if="dialog.show")
      //- Alert
      Alert(:alert="alert")
</template>

<script>
import Alert from '~/components/Alert.vue'
import Scanner from '~/components/Scanner.vue'
import ItemDialog from '~/components/ItemDialog.vue'

export default {
  components: {
    Scanner,
    Alert,
    ItemDialog
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
      dialog: {
        show: false,
        data: {}
      },
      rules: {
        required: v => (v !== 0) || !!v || '必填',
        price: v => v >= 0 || '價格不正確',
        number: v => v >= -1 || '數字不正確'
      },
      dialogEdit: {
        show: false,
        title: '',
        valid: false,
        code: 0,
        data: {
          name: '',
          price: 0,
          cost: 0,
          quantity: 0,
          quantity2: 0,
          diff: 0,
          storage: '',
          action: 3
        }
      },
      headers: [
        { text: '品名', value: 'name' },
        { text: '庫存', value: 'quantity' },
        { text: '本月銷售', value: 'sells' },
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
      return this.items.filter((item) => {
        return item.name.toUpperCase().includes(this.search.toUpperCase())
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
          // group items by month
          const arranged = this.$_.groupBy(item.history, (history) => {
            const dateMoment = this.$moment(history.date).format('YYYY/M')
            return dateMoment
          })
          item.sells = 0
          const now = new Date()
          const key = `${now.getFullYear()}/${now.getMonth() + 1}`
          if (arranged[key]) {
            for (const data of arranged[key]) {
              if (data.action === 1) { item.sells += data.diff * -1 }
            }
          }
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
    info (item) {
      this.dialog.item = item
      this.dialog.show = true
    },
    getAssetsUrl (file) {
      return this.$axios.defaults.baseURL + '/assets/' + file
    },
    decode (data) {
      const index = this.items.findIndex((item) => {
        return item.code === data
      })
      if (index >= 0) {
        this.dialog.data = this.items[index]
        this.dialog.show = true
      } else {
        this.alert.type = 'error'
        this.alert.show = true
        this.alert.text = '不存在的品項'
      }
    },
    edit (item) {
      this.dialogEdit.data = item.history[item.history.length - 1]
      this.dialogEdit.data.storage = item.storage
      this.dialogEdit.data.name = item.name
      this.dialogEdit.data.action = 3
      this.dialogEdit.data.quantity2 = this.dialogEdit.data.quantity
      this.dialogEdit.title = item.name
      this.dialogEdit.code = item.code
      this.dialogEdit.show = true
    },
    async saveEdit () {
      if (this.dialogEdit.valid) {
        this.dialogEdit.data.diff = this.dialogEdit.data.quantity - this.dialogEdit.data.quantity2

        try {
          await this.$axios.patch('/items', this.dialogEdit)
          const idx = this.items.findIndex(item => item.code === this.dialogEdit.code)
          this.items[idx].name = this.dialogEdit.data.name
          this.items[idx].storage = this.dialogEdit.data.storage
          this.items[idx].history.push(
            {
              quantity: this.dialogEdit.data.quantity,
              cost: this.dialogEdit.data.cost,
              price: this.dialogEdit.data.price,
              action: 3,
              diff: this.dialogEdit.data.diff
            }
          )
          this.cancelEdit()
        } catch (error) {
          const msg = error.response.message || '伺服器發生錯誤'
          this.alert.type = 'error'
          this.alert.show = true
          this.alert.text = msg
        }
      }
    },
    cancelEdit () {
      this.$refs.editform.reset()
      this.$refs.editform.resetValidation()
      this.dialogEdit = {
        show: false,
        title: '',
        valid: false,
        code: 0,
        data: {
          name: '',
          price: 0,
          cost: 0,
          quantity: 0,
          quantity2: 0,
          diff: 0,
          storage: '',
          action: 3
        }
      }
    }
  },
  head () {
    return {
      title: '易RP - 商品查詢'
    }
  }
}
</script>
