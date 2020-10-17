<template lang="pug">
  v-app(dark)
    v-app-bar(app)
      v-toolbar-title
        img#logo(src="/liff/logo.svg" height="40px" style="vertical-align: bottom; height: 40px")
    v-main
      v-container
        nuxt
    v-footer(app)
      span © {{ new Date().getFullYear() }}
    v-overlay.text-center(:opacity="overlay.opacity" :value="overlay.show")
      v-progress-circular(indeterminate size="64" color="cyan")
      p.text-center.my-4 {{ overlay.text }}
</template>

<script>
export default {
  computed: {
    liff: {
      get () {
        return this.$store.getters.liff
      },
      set (value) {
        this.$store.commit('initliff', value)
      }
    },
    login: {
      get () {
        return this.$store.getters.login
      },
      set (value) {
        this.$store.commit('login', value)
      }
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
  async created () {
    if (process.client) {
      let errormsg = ''
      this.liff = require('@line/liff')
      await this.liff.init({ liffId: process.env.CHANNEL_LIFF })
      if (!this.liff.isLoggedIn()) {
        this.liff.login()
      }
      this.login = this.liff.isLoggedIn()
      await this.liff.ready

      let profile
      try {
        profile = await this.liff.getProfile()
        // validate user and update data
        const response = await this.$axios.patch('/users/?line=' + profile.userId, { name: profile.displayName, avatar: profile.pictureUrl })
        if (response.data.success) {
          profile.role = response.data.result.role
          this.profile = profile
        } else {
          errormsg = '系統錯誤'
        }
      } catch (error) {
        // 404 = user not found
        // employee-id is new member register page
        if (error.response.status === 404) {
          if (this.$route.name !== 'employee-id') {
            errormsg = '非系統使用者'
          } else {
            profile.role = -1
            this.profile = profile
          }
        } else {
          errormsg = '系統錯誤'
        }
      }

      if (errormsg.length > 0) {
        this.$swal.fire({
          type: 'error',
          title: '錯誤',
          text: errormsg
        }).then(() => {
          this.liff.closeWindow()
        })
      }
    }
  }
}
</script>
