const User = require('../user/model')
const config = require('../config')

const passport = require('passport')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const { getToken } = require('../utils/get-token')

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

const me = (req, res, next) => {
    if(!req.user) {
        return res.json({
            error: 1,
            message: `You're not login or token expired`
        })
    }

    return res.json(req.user)
}

const logout = async(req, res, next) => {
    let token = getToken(req)

    let user = await User.findOneAndUpdate(
        { token: {$in: [token]} },
        { $pull: {token}},
        { useFindAndModify: false }
    )

    // cek user atau token
    if(!token || !user) {
        res.json({
            error: 1,
            message: 'No user found'
        })
    }

    // logout berhasil
    return res.json({
        error: 0,
        message: 'Logout berhasil'
    })
}

module.exports = {
    register,
    localStrategy,
    login,
    me,
    logout
}