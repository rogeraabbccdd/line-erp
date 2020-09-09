<template lang="pug">
  //- 員工管理
  #employee
    div(v-if="inited")
      h1.text-center 員工管理
      v-container
        v-row(align="center")
          v-col(cols="6" md="3" v-for="(employee, index) in employees" :key="index" v-if="employee.line !== profile.userId")
            v-card(color="grey darken-3")
              v-img.align-end(:src="employee.avatar ? employee.avatar : '/liff/default_avatar.png'" gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)" height="200px")
                v-card-title {{ employee.name ? employee.name: '未使用的邀請' }}
              v-card-actions
                v-spacer
                span
                v-btn(icon @click="del(index)")
                  v-icon delete
                v-btn(icon @click="send(getEmployeeUrl(employee._id))" v-if="!employee.name")
                  v-icon send
          v-col(cols="12" v-if="employees.length === 1")
            p.text-center 沒有資料
      v-btn(fixed fab right bottom dark color="cyan" @click="add")
        v-icon add
</template>

<script>
export default {
  data () {
    return {
      employees: [],
      inited: false
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
          // only boss can access this page
          if (newValue.role === 0) {
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
    if (this.profile.role === 0) {
      this.init()
    }
  },
  methods: {
    getEmployeeUrl (id) {
      return 'https://liff.line.me/' + process.env.CHANNEL_LIFF + '/employee/' + id
    },
    async add () {
      if (process.client) {
        try {
          const response = await this.$axios.post('/users', { role: 1 })
          const _id = response.data.result._id
          this.employees.push({ _id })
          this.send(this.getEmployeeUrl(_id))
        } catch (error) {
          this.$swal.fire({
            type: 'error',
            title: '錯誤',
            text: '系統錯誤'
          })
        }
      }
    },
    async send (text) {
      await this.liff.shareTargetPicker([{ type: 'text', text }])
    },
    async init () {
      try {
        // fetch all
        const response = await this.$axios.get('/users')
        this.employees = response.data.result.sort((a, b) => a - b)
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
    async del (index) {
      try {
        const response = await this.$axios.delete('/users?_id=' + this.employees[index]._id)
        if (response.data.success) {
          this.employees.splice(index, 1)
        } else {
          this.$swal.fire({
            type: 'error',
            title: '錯誤',
            text: '系統錯誤'
          })
        }
      } catch (error) {
        this.$swal.fire({
          type: 'error',
          title: '錯誤',
          text: '系統錯誤'
        })
      }
    }
  },
  head () {
    return {
      title: '易RP - 員工管理'
    }
  }
}
</script>
