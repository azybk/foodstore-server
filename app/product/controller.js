const Product = require('./model')

const store = async(req, res, next) => {
    let payload = req.body

    let product = new Product(payload)
    await product.save()

    return res.json(product)
}

module.exports = {
    store
}