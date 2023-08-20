const User = require('../user/model')
const config = require('../config')

const passport = require('passport')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const register = async(req, res, next) => {
    try {        
        let payload = req.body        
        let user = new User(payload)        
        await user.save()
        
        return res.json(user)

    } catch(err) {
        if(err && err.name === 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            })
        }

        next(err)
    }
}

const localStrategy = async(email, password, done) => {
    try {
        let user = 
            await User
            .findOne({email})
            .select('-__v -createdAt -updatedAt -cart_items -token')
        
        if(!user) return done()

        if(bcrypt.compareSync(password, user.password)) {
            ( {password, ...userWithoutPassword} =  user.toJSON())

            return done(null, userWithoutPassword)
        }

    } catch(err) {
        done(err, null)
    }

    done()  // password tidak sesuai
}

const login = async(req, res, next) => {
    passport.authenticate('local', async function(err, user) {
        if(err) return next(err)

        if(!user) return res.json({
            error: 1,
            message: 'email or password incorrect'
        })

        // user ditemukan, buat JWT
        let signed = jwt.sign(user, config.secretKey)

        // simpan token ke user
        await User.findOneAndUpdate(
            { _id: user._id },
            { $push: {
                token: signed
            }},
            { new: true }
        )
        return res.json({
            message: 'logged succesfully',
            user: user,
            token: signed
        })

    })(req, res, next)
}

module.exports = {
    register,
    localStrategy,
    login
}