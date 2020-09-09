<template lang="pug">
  #new-item
    div(v-if="inited")
      h1.text-center 新增品項
      //- Form
      v-form(ref="form" v-model="form.valid")
        v-text-field(v-model.number="form.code" label="條碼" :rules="[rules.required]" required @focus="openScanner")
        v-text-field(v-model="form.name" label="品名" v-if="form.code" required :rules="[rules.required]")
        v-text-field(v-model="form.storage" label="存放區" v-if="form.code" required :rules="[rules.required]")
        v-text-field(v-model.number="form.cost" label="成本價" v-if="form.code" required :rules="[rules.required, rules.price]")
        v-text-field(v-model.number="form.price" label="銷售價" v-if="form.code" required :rules="[rules.required, rules.price]")
        client-only
          div.text-center
            img-inputer.mx-auto(capture v-if="form.code" v-model="form.file" theme="dark" placeholder="點擊上傳圖片" bottom-text="點擊更換圖片" accept="image/*")
        p.text-center
          v-btn(color="success" @click="add" v-if="form.code") 新增
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
      //- Finish dialog
      v-dialog(v-model="finish" width="500")
        v-card
          v-card-title.headline 新增成功
          v-card-text 是否繼續新增下一項商品？
          v-divider.my-3.success(style="opacity: 0.22")
          p.text-center
            v-btn.mx-4(color="green" @click="gonext" text) 確定
            v-btn.mx-4(color="red" @click="exit" text) 離開
</template>

<script>
import Alert from '~/components/Alert.vue'
import Scanner from '~/components/Scanner.vue'

export default {
  name: 'New',
  components: {
    Alert,
    Scanner
  },
  data () {
    return {
      inited: false,
      form: {
        name: '',
        code: '',
        cost: 0,
        price: 0,
        valid: false,
        file: null,
        storage: ''
      },
      rules: {
        required: v => !!v || '必填',
        price: v => v >= 0 || '價格不正確'
      },
      scanner: false,
      alert: {
        show: false,
        text: '',
        type: ''
      },
      added: [],
      finish: false
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
    openScanner (event) {
      event.preventDefault()
      this.scanner = true
      this.form.code = ''
    },
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
      this.overlay.text = '搜尋資料中'
      this.overlay.opacity = 0.7
      this.overlay.show = true

      const hasItem = this.items.filter((item) => {
        return parseInt(item.code) === parseInt(data)
      }).length

      if (hasItem > 0) {
        this.alert.show = true
        this.alert.type = 'error'
        this.alert.text = '品項已存在'
      } else {
        this.form.code = data
        this.scanner = false
      }

      this.overlay.show = false
    },
    reset () {
      this.$refs.form.reset()
      this.$refs.form.resetValidation()
    },
    async add () {
      if (this.form.valid && this.form.file) {
        this.overlay.text = '上傳資料中'
        this.overlay.opacity = 0.7
        this.overlay.show = true
        const fd = new FormData()
        for (const key in this.form) {
          fd.append(key, this.form[key])
        }
        try {
          await this.$axios.post('/items', fd)
          this.added.push({
            name: this.form.name,
            code: this.form.code,
            cost: this.form.cost,
            price: this.form.price,
            storage: this.form.storage
          })
          this.items.push({
            name: this.form.name,
            code: this.form.code,
            cost: this.form.cost,
            price: this.form.price,
            storage: this.form.storage
          })
          this.finish = true
        } catch (error) {
          const msg = error.response.message || '伺服器發生錯誤'
          this.alert.type = 'error'
          this.alert.show = true
          this.alert.text = msg
        }

        this.overlay.show = false
      }
    },
    gonext () {
      this.form = {
        name: '',
        code: '',
        cost: 0,
        price: 0,
        valid: false,
        file: undefined
      }
      this.finish = false
    },
    exit () {
      if (this.inited) {
        // const items = this.added.map((add) => {
        //   return add.name
        // }).slice(0, 3).join('、')

        // this.liff.sendMessages([
        //   {
        //     type: 'text',
        //     text: `已於${new Date().toLocaleDateString()}新增${items}等${this.added.length}樣品項`
        //   }
        // ])
        //   .finally(() => {
        //     this.liff.closeWindow()
        //   })

        history.back()
      }
    }
  },
  head () {
    return {
      title: '易RP - 新增品項'
    }
  }
}
</script>
