require('dotenv').config()
require('./database')

const fs = require('fs')
const https = require('https')
const consola = require('consola')
const express = require('express')
const { Nuxt, Builder } = require('nuxt')
const nuxtconfig = require('./liff/nuxt.config.js')
const routeBot = require('./bot')
const routeAPI = require('./api')

const dev = process.env.NODE_ENV.trim() === 'dev'

const usehttps = process.env.HTTPS.trim() === 'true'

const port = process.env.PORT || 3000

const app = express()

const start = async () => {
  const nuxt = new Nuxt(nuxtconfig)

  if (dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  // Handle line bot webhook in 'bot'
  app.use('/bot', routeBot)

  // Handle API requests from liff in '/api'
  app.use('/api', routeAPI)

  // Handle liff page request in '/liff'
  app.use(nuxt.render)

  // Handle other requests
  app.all('*', (req, res) => {
    res.sendStatus(404)
  })

  if (usehttps) {
    const key = fs.readFileSync('./key.pem')
    const cert = fs.readFileSync('./cert.pem')
    const server = https.createServer({ key, cert }, app)
    server.listen(port, () => {
      consola.success('Server started at https://localhost:' + port)
    })
  } else {
    app.listen(port, () => {
      consola.success('Server started at http://localhost:' + port)
    })
  }
}

start()
