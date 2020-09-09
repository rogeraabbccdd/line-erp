// const consola = require('consola')
const linebot = require('linebot')

const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

// const liff = 'https://liff.line.me/' + process.env.CHANNEL_LIFF

bot.on('message', (event) => {
  if (event.message.type === 'text') {
    if (event.message.text.match(/已於.*完成出貨/gm)) {
      event.reply('系統出貨成功!')
    } else if (event.message.text.match(/已於.*完成進貨/gm)) {
      event.reply('系統進貨成功!')
    } else if (event.message.text.match(/已於.*完成盤點/gm)) {
      event.reply('系統盤點成功!')
    }
  }
})

module.exports = bot
