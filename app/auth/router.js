const router = require('express').Router()
const multer = require('multer')

const controller = require('./controller')

const passport = require('passport')
const localStrategy = require('passport-local').Strategy

passport.use(new localStrategy({usernameField: 'email'}, controller.localStrategy))

router.post('/register', multer().none(), controller.register)
router.post('/login', multer().none(), controller.login)


module.exports = router