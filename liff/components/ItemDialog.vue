<template lang="pug">
  v-dialog(v-model="data.show" width="500")
    v-card
      v-img(:src="getAssetsUrl(data.item.image)" height="200px")
      v-card-title {{ data.item.name }}
      v-card-text.text--primary
        | 庫存: {{ data.item.history[data.item.history.length-1].quantity }}
        br
        | 成本價: {{ data.item.history[data.item.history.length-1].cost }}
        br
        | 銷售價: {{ data.item.history[data.item.history.length-1].price }}
        br
        | 存放區: {{ data.item.storage }}
        br
        | 條碼: {{ data.item.code }}
      v-card-text.text--primary
        | 銷售額
        apexchart(type="line" :options="options" :series="series")
      v-divider
      v-card-actions
        v-spacer
        v-btn(color="error" text @click="data.show = false") 關閉
        v-spacer
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      default () {
        return {
          show: false,
          item: {
            image: '',
            name: '',
            quantity: 0,
            cost: 0,
            price: 0,
            storage: '',
            code: 0,
            history: []
          }
        }
      }
    }
  },
  computed: {
    options () {
      const categories = Object.keys(this.arrangedItems)
      return {
        chart: {
          id: 'vuechart'
        },
        xaxis: {
          categories
        },
        theme: {
          mode: 'dark'
        }
      }
    },
    arrangedItems () {
      return this.$_.groupBy(this.data.item.history, (history) => {
        const dateMoment = this.$moment(history.date).format('YYYY/M')
        return dateMoment
      })
    },
    series () {
      const diffs = []
      for (const key1 in this.arrangedItems) {
        let sum = 0
        for (const value of this.arrangedItems[key1]) {
          if (value.action === 1) { sum += value.diff * -1 }
        }
        diffs.push(sum)
      }
      return [{
        name: '數量',
        data: diffs
      }]
    }
  },
  methods: {
    getAssetsUrl (file) {
      return this.$axios.defaults.baseURL + '/assets/' + file
    }
  }
}
</script>
