// const consola = require('consola')
const express = require('express')
const bodyParser = require('body-parser')
const bot = require('./bot.js')

const router = express.Router()

router.use(bodyParser.json({
  verify (req, res, buf, encoding) {
    req.rawBody = buf.toString(encoding)
  }
}))

router.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    res.status(400).send({ success: false, message: '格式錯誤' })
  } else { next() }
})

router.post('/', (req, res) => {
  bot.parse(req.body)
  return res.json({})
})

module.exports = router
