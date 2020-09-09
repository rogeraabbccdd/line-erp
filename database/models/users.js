const mongoose = require('mongoose')

const Schema = mongoose.Schema

const usersSchema = new Schema(
  {
    // LINE user id
    line: {
      type: String,
      trim: true,
      index: {
        unique: '使用者已存在',
        partialFilterExpression: {
          line: {
            $type: 'string'
          }
        }
      },
      set: v => (v === '' ? null : v)
    },
    // LINE user name
    name: {
      type: String,
      default: ''
    },
    // LINE user avatar
    avatar: {
      type: String,
      default: ''
    },
    // role:
    // -2 = not inited
    // -1 = not member
    // 0 = boss
    // 1 = employee
    role: {
      type: Number,
      required: [true, '員工身分必填'],
      default: 1
    }
  },
  {
    versionKey: false
  }
)

module.exports = mongoose.model('users', usersSchema, 'users')
