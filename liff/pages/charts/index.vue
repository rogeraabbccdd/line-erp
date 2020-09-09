<template lang="pug">
  #charts
    div(v-if="inited")
      h1.text-center 報表查詢
      br
      v-container
        v-tabs.elevation-2(background-color="cyan accent-4" dark centered grow color="white")
          v-tabs-slider
          v-tab(href="#sells") 銷售金額
          v-tab(href="#stock") 成本支出
          v-tab(href="#earn") 利潤收入
          v-tab-item(value="sells")
            v-card(flat tile)
            v-card-text
              apexchart(type="line" :options="optionsSell" :series="seriesSell")
          v-tab-item(value="stock")
            v-card(flat tile)
            v-card-text
              apexchart(type="line" :options="optionsStock" :series="seriesStock")
          v-tab-item(value="earn")
            v-card(flat tile)
            v-card-text
              apexchart(type="line" :options="optionsEarn" :series="seriesEarn")
</template>

<script>
export default {
  data () {
    return {
      inited: false,
      items: [],
      tab: null
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
    arrangedItems () {
      const items = this.items.map((item) => {
        item.history = this.$_.groupBy(item.history, (history) => {
          const dateMoment = this.$moment(history.date).format('YYYY/M')
          return dateMoment
        })
        return item
      }).reverse()
      const sells = {}
      const stock = {}
      const earn = {}
      for (const item of items) {
        for (const date in item.history) {
          for (const data of item.history[date]) {
            let value = 0
            switch (data.action) {
              case 1:
                value = data.diff * -1 * data.price
                if (sells[date]) {
                  sells[date] += value
                } else {
                  sells[date] = value
                }
                value = data.diff * -1 * (data.price - data.cost)
                if (earn[date]) {
                  earn[date] += value
                } else {
                  earn[date] = value
                }
                break
              case 2:
                value = data.diff * data.cost
                if (stock[date]) {
                  stock[date] += value
                } else {
                  stock[date] = value
                }
                break
            }
          }
        }
      }
      return { stock, sells, earn }
    },
    optionsSell () {
      const categories = Object.keys(this.arrangedItems.sells) || {}
      return {
        chart: {
          id: 'chart-sells'
        },
        xaxis: {
          categories
        },
        theme: {
          mode: 'dark'
        }
      }
    },
    optionsStock () {
      const categories = Object.keys(this.arrangedItems.stock) || {}
      return {
        chart: {
          id: 'chart-stock'
        },
        xaxis: {
          categories
        },
        theme: {
          mode: 'dark'
        }
      }
    },
    optionsEarn () {
      const categories = Object.keys(this.arrangedItems.earn) || {}
      return {
        chart: {
          id: 'chart-earn'
        },
        xaxis: {
          categories
        },
        theme: {
          mode: 'dark'
        }
      }
    },
    seriesSell () {
      const data = []
      if (Object.keys(this.arrangedItems.sells).length > 0) {
        for (const date in this.arrangedItems.sells) {
          data.push(this.arrangedItems.sells[date])
        }
      }
      return [{
        name: '銷售收入',
        data
      }]
    },
    seriesStock () {
      const data = []
      if (Object.keys(this.arrangedItems.stock).length > 0) {
        for (const date in this.arrangedItems.stock) {
          data.push(this.arrangedItems.stock[date])
        }
      }
      return [{
        name: '成本支出',
        data
      }]
    },
    seriesEarn () {
      const data = []
      if (Object.keys(this.arrangedItems.earn).length > 0) {
        for (const date in this.arrangedItems.earn) {
          data.push(this.arrangedItems.earn[date])
        }
      }
      return [{
        name: '利潤',
        data
      }]
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
    }
  },
  head () {
    return {
      title: '易RP - 報表查詢'
    }
  }
}
</script>
