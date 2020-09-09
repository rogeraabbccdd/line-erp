const users = require('../models/users.js')

const add = async (req, res) => {
  try {
    const result = await users.create(req.body)
    res.status(200)
    res.send({ success: true, message: '', result })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400)
      res.send({ success: false, message })
    } else {
      res.status(500)
      res.send({ success: false, message: '伺服器發生錯誤' })
    }
  }
}

const patch = async (req, res) => {
  try {
    const filter = {}
    if (req.query.line) { filter.line = req.query.line }
    if (req.query._id) { filter._id = req.query._id }

    // only accpet request with line id or db id
    if (Object.keys(filter).length === 0) {
      res.status(400)
      res.send({ success: false, message: '格式錯誤' })
      return
    }

    // update
    const result = await users.findOneAndUpdate(
      filter, req.body, { new: true }
    )

    // user not found
    if (result === null) {
      res.status(404)
      res.send({ success: false, message: '找不到使用者' })
    } else {
      res.status(200)
      res.send({ success: true, message: '', result })
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400)
      res.send({ success: false, message })
    } else {
      res.status(500)
      res.send({ success: false, message: '伺服器發生錯誤' })
    }
  }
}

const search = async (req, res) => {
  try {
    const filter = req.query.filter === undefined ? {} : JSON.parse(req.query.filter)
    const result = await users.find(filter)
    res.status(200)
    res.send({ success: true, message: '', result })
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(400)
      res.send({ success: false, message: '格式錯誤' })
    } else if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400)
      res.send({ success: false, message })
    } else {
      res.status(500)
      res.send({ success: false, message: '伺服器發生錯誤' })
    }
  }
}

const del = async (req, res) => {
  try {
    const filter = {}
    if (req.query.line) { filter.line = req.query.line }
    if (req.query._id) { filter._id = req.query._id }

    // only accpet request with line id or db id
    if (Object.keys(filter).length === 0) {
      res.status(400)
      res.send({ success: false, message: '格式錯誤' })
      return
    }
    await users.deleteOne(filter)
    res.status(200)
    res.send({ success: true, message: '' })
  } catch (error) {
    res.status(500)
    res.send({ success: false, message: '伺服器發生錯誤' })
  }
}

module.exports = {
  add,
  patch,
  search,
  del
}
