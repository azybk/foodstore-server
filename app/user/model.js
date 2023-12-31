const mongoose = require('mongoose')
const { model, Schema } = mongoose

const bcrypt = require('bcrypt')
const HASH_ROUND = 10

const AutoIncrement = require('mongoose-sequence')(mongoose)

let userSchema = Schema({
    full_name: {
        type: String,
        required: [true, 'Nama harus diisi'],
        maxlength: [255, 'Panjang Nama antara 3 - 255 Karakter'],
        minlength: [3, 'Panjang Nama antara 3 - 255 Karakter']
    },
    customer_id: {
        type: Number
    },
    email: {
        type: String,
        required: [true, 'email harus diisi'],
        maxlength: [255, 'panjang email maksimal 255 karakter']
    },
    password: {
        type: String,
        required: [true, 'Password harus diisi'],
        maxlength: [255, 'Panjang Password maksimal 255 karakter']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    token: [String]

}, { timestamps: true })


userSchema.path('email').validate(function(value) {
    const EMAIL_RE = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/
    return EMAIL_RE.test(value)

}, attr => `${attr.value} harus merupakan email yang valid!`)

userSchema.path('email').validate(async function(value) {
    try {
        const count = await this.model('User').count({email: value})
        return !count

    } catch(err) {
        throw err
    }
}, attr => `email ${attr.value} sudah terdaftar`)

userSchema.pre('save', function(next) {
    this.password = bcrypt.hashSync(this.password, HASH_ROUND)
    next()
})

// userSchema.plugin(AutoIncrement, {inc_field: 'customer_id', disable_hooks: true})

module.exports = model('User', userSchema)