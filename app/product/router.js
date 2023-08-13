const router = require('express').Router()
const multer = require('multer')
const productController = require('./controller')

const os = require('os')

router.post('/products', multer({dest: os.tmpdir()}).single('image'), productController.store)

module.exports = router