const consola = require('consola')
const mongoose = require('mongoose')
const beautifyUnique = require('mongoose-beautiful-unique-validation')

mongoose.connect(process.env.URL_DB, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
mongoose.set('useCreateIndex', true)
mongoose.plugin(beautifyUnique)

const connection = mongoose.connection
connection.once('error', () => {
  consola.error('Database connect error')
  process.exit()
})
connection.once('open', () => {
  consola.success('Database connected')
})
connection.once('disconnected', () => {
  consola.error('Database disconnected')
  process.exit()
})

module.exports = connection
