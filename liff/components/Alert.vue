<template lang="pug">
  v-dialog(v-model="alert.show" width="500")
      v-alert(v-model="alert.show" transition="scale-transition" prominent :type="alert.type" dismissible)
        v-row(align="center")
          v-col.grow {{ alert.text }}
            span(v-if="alert.text === '不存在的品項'") ，
            nuxt-link.white--text.text-decoration-none.font-weight-bold(v-if="alert.text === '不存在的品項'" to="/items/new") 點此新增
</template>

<script>
export default {
  props: {
    alert: {
      type: Object,
      default () {
        return {
          show: false,
          text: '',
          type: ''
        }
      }
    }
  }
}
</script>
