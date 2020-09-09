const path = require('path')
const multer = require('multer')
const FTPStorage = require('multer-ftp')

let storage
if (process.env.FTP === 'false') {
  storage = multer.diskStorage({
    destination (req, file, cb) {
      cb(null, '.upload/')
    },
    filename (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname))
    }
  })
} else {
  storage = new FTPStorage({
    basepath: process.env.FTP_DIR,
    ftp: {
      host: process.env.FTP_HOST,
      secure: false,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASS
    },
    destination (req, file, options, cb) {
      cb(null, options.basepath + Date.now() + path.extname(file.originalname))
    }
  })
}

const upload = multer({
  storage,
  fileFilter (req, file, cb) {
    if (!file.mimetype.includes('image')) {
      cb(new multer.MulterError('LIMIT_FORMAT'), false)
    } else { cb(null, true) }
  },
  limits: {
    fileSize: 1024 * 1024 * 5
  }
})

const uploadAsync = (req, res) => {
  return new Promise((resolve, reject) => {
    upload.single('file')(req, res, (err) => {
      if (err !== undefined) { return reject(err) }
      resolve(req)
    })
  })
}

module.exports = uploadAsync
