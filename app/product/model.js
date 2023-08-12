const mongoose = require('mongoose')
const { model, Schema } = mongoose

const productSchema = Schema({
    name: {
        type: String,
        minlength: [3, 'Panjang nama produk minimal 3 karakter'],
        required: [true, 'Name harus diisi']
    },
    description: {  
        type: String,
        maxlength: [1000, 'Panjang maksimal deskripsi 1000 karakter']
    },
    price: {
        type: Number,
        default: 0
    },
    image_url: String

}, { timestamps: true })

module.exports = model('Product', productSchema)