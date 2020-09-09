const fs = require('fs')

const file = (req, res) => {
  if (process.env.FTP === 'false') {
    if (fs.existsSync(process.cwd() + '/.upload/' + req.params.file)) {
      res.status(200).sendFile('./.upload/' + req.params.file, { root: process.cwd() })
    } else { res.sendStatus(404) }
  } else {
    res.redirect(process.env.URL_ASSETS + '/' + req.params.file)
  }
}

module.exports = {
  file
}
