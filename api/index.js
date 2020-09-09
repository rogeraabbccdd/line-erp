const express = require('express')
const bodyParser = require('body-parser')
const items = require('../database/controllers/items.js')
const users = require('../database/controllers/users.js')
const assets = require('../database/controllers/assets.js')

const router = express.Router()

router.use(bodyParser.json())

router.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    res.status(400).send({ success: false, message: '格式錯誤' })
  } else { next() }
})

// items
router.get('/items', items.search)
router.post('/items', items.add)
router.patch('/items/history', items.history)
router.patch('/items', items.edit)

// users
router.get('/users', users.search)
router.post('/users', users.add)
router.patch('/users', users.patch)
router.delete('/users', users.del)

// assets
router.get('/assets/:file', assets.file)

module.exports = router
