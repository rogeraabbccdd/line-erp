const mongoose = require('mongoose')

const Schema = mongoose.Schema

const historySchema = new Schema({
  // 成本價格
  cost: {
    type: Number,
    required: [true, '成本價格未填']
  },
  // 出售價格
  price: {
    type: Number,
    required: [true, '出售價格未填']
  },
  // 數量
  quantity: {
    type: Number,
    default: 0
  },
  diff: {
    type: Number,
    default: 0
  },
  // 日期
  date: {
    type: Date,
    required: [true, '日期未填'],
    default: Date.now
  },
  // 動作
  // 0 = 建立
  // 1 = 銷售
  // 2 = 進貨
  // 3 = 編輯
  // 4 = 盤點
  action: {
    type: Number,
    required: [true, '動作未填']
  }
})

const itemsSchema = new Schema(
  {
    // 品名
    name: {
      type: String,
      required: [true, '品名未填']
    },
    // 條碼
    code: {
      type: Number,
      required: [true, '條碼未填'],
      unique: '品項已存在',
      default: ''
    },
    // 歷史紀錄
    history: {
      type: [historySchema]
    },
    // 圖片
    image: {
      type: String,
      default: ''
    },
    // 存放區域
    storage: {
      type: String,
      required: [true, '存放區未填']
    }
  },
  {
    versionKey: false
  }
)

module.exports = mongoose.model('items', itemsSchema, 'items')
