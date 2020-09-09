<template lang="pug">
  #scanner
    client-only
      StreamBarcodeReader(@decode="decode")
</template>

<script>
export default {
  props: {
    stop: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      beep: undefined,
      cooldown: false
    }
  },
  created () {
    if (process.client) {
      // preload beep sound
      this.beep = new Audio()
      this.beep.src = '/liff/beep.mp3'
      this.beep.preload = true
    }
  },
  methods: {
    decode (data) {
      if (!this.cooldown && !this.stop) {
        this.cooldown = true
        setTimeout(() => {
          this.cooldown = false
        }, 1000)

        if (process.client) {
          this.beep.play()
        }

        this.$emit('decode', parseInt(data))
      }
    }
  }
}
</script>
