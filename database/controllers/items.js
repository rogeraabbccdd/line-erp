const path = require('path')
const items = require('../models/items.js')
const uploadAsync = require('../upload.js')

const add = async (req, res) => {
  try {
    const reqq = await uploadAsync(req, res)
    const history = {
      cost: reqq.body.cost,
      price: reqq.body.price,
      quantity: 0,
      action: 0
    }
    const image = process.env.FTP === 'true' ? path.basename(req.file.path) : reqq.file.filename
    const result = await items.create(
      {
        name: reqq.body.name,
        code: reqq.body.code,
        image,
        storage: reqq.body.storage,
        history: [history]
      }
    )
    res.status(200)
    res.send({ success: true, message: '', result })
  } catch (error) {
    if (error.name === 'MulterError') {
      const message = (error.code === 'LIMIT_FORMAT') ? [400, '圖片格式不符'] : (error.code === 'LIMIT_SIZE') ? [400, '圖片太大'] : [500, '伺服器錯誤']
      res.status(message[0]).send({ result: 'no', message: message[1] })
    } else if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400)
      res.send({ success: false, message })
    } else {
      res.status(500)
      res.send({ success: false, message: '伺服器發生錯誤' })
      console.log(error)
    }
  }
}

const search = async (req, res) => {
  const result = await items.find(req.query)
  if (result.length > 0) {
    res.status(200)
    res.send({ success: true, message: '', result })
  } else {
    res.status(404)
    res.send({ success: false, message: '找不到' })
  }
}

const history = async (req, res) => {
  try {
    for (const item of req.body.items) {
      const history = {
        cost: item.cost,
        price: item.price,
        quantity: item.quantity,
        action: req.body.action
      }
      await items.updateOne(
        { code: item.code },
        { $push: { history } }
      )
    }
    res.status(200)
    res.send({ success: true, message: '' })
  } catch (error) {
    res.status(500)
    res.send({ success: false, message: '伺服器發生錯誤' })
    console.log(error)
  }
}

const edit = async (req, res) => {
  try {
    const item = req.body
    await items.updateOne(
      { code: item.code },
      {
        name: item.data.name,
        storage: item.data.storage,
        $push: { history: item.data }
      }
    )
    res.status(200)
    res.send({ success: true, message: '' })
  } catch (error) {
    res.status(500)
    res.send({ success: false, message: '伺服器發生錯誤' })
    console.log(error)
  }
}

module.exports = {
  add,
  search,
  history,
  edit
}
