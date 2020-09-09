<template lang="pug">
  #new-employee
    div(v-if="inited")
      h1.text-center 加入易RP
        v-container
          v-row(align="center" justify="center")
            v-col.text-center(cols="12")
              v-avatar(size="200")
                img(:src="profile.pictureUrl")
              v-btn.my-4(block color="success" dark @click="join") 加入
</template>

<script>
export default {
  data () {
    return {
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
    _id () {
      return this.$route.params.id
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
          if (newValue.role === -1) {
            this.init()
          } else {
            this.$swal.fire({
              type: 'error',
              title: '錯誤',
              text: '已是使用者'
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
    if (this.profile.role === -1) {
      this.init()
    }
  },
  methods: {
    async init () {
      if (process.client) {
        try {
          // valid id
          const filter = {
            $or: [{ line: this.profile.userId }, { _id: this._id }]
          }
          const response = await this.$axios.get('/users?filter=' + JSON.stringify(filter))
          // wrong id
          if (response.data.result.length === 0) {
            this.$swal.fire({
              type: 'error',
              title: '錯誤',
              text: '不存在的 ID'
            }).then(() => {
              this.liff.closeWindow()
            })
          } else {
            let used = false
            let member = false
            for (const data of response.data.result) {
              if (data._id === this._id && data.line) { used = true }
              if (data.line === this.profile.userId) { member = true }
            }
            // used id
            if (used) {
              this.$swal.fire({
                type: 'error',
                title: '錯誤',
                text: 'ID 已使用'
              }).then(() => {
                this.liff.closeWindow()
              })
            } else if (member) {
              this.$swal.fire({
                type: 'error',
                title: '錯誤',
                text: '已是使用者'
              }).then(() => {
                this.liff.closeWindow()
              })
            } else {
              this.inited = true
              this.overlay.show = false
            }
          }
        } catch (error) {
          this.$swal.fire({
            type: 'error',
            title: '錯誤',
            text: '系統錯誤'
          }).then(() => {
            this.liff.closeWindow()
          })
        }
      }
    },
    async join () {
      try {
        await this.$axios.patch('/users?_id=' + this._id, { name: this.profile.displayName, avatar: this.profile.pictureUrl, line: this.profile.userId })
        this.$swal.fire({
          type: 'success',
          title: '成功',
          text: '成功加入系統'
        }).then(() => {
          this.liff.closeWindow()
        })
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
      title: '歡迎加入易RP'
    }
  }
}
</script>
