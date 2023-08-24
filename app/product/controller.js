const Product = require('./model')
const config = require('../config')

const fs = require('fs')
const path = require('path')

const { policyFor } = require('../policy')

const store = async(req, res, next) => {

    try {

        let policy = policyFor(req.user)
        if(!policy.can('create', 'Product')) {
            return res.json({
                error: 1,
                message: 'Anda tidak memiliki akses untuk membuat Produk'
            })
        }

        let payload = req.body

        if(req.file) {
            let tmp_path = req.file.path
            let originalExt = req.file.originalname.split('.')
            [req.file.originalname.split('.').length - 1]

            let filename = req.file.filename + '.' + originalExt
            let target_path = path.resolve(config.rootPath, `public/upload/${filename}`)

            const src = fs.createReadStream(tmp_path)
            const dest = fs.createWriteStream(target_path)
            src.pipe(dest)

            src.on('end', async() => {
                try {
                    let product = new Product({...payload, image_url: filename})
                    await product.save()
                    return res.json(product)

                } catch(err) {
                    // jika error hapus file yang sudah terupload pada direktori
                    fs.unlinkSync(target_path)

                    if(err && err.name === 'ValidationError') {
                        return res.json({
                            error: 1,
                            message: err.message,
                            fields: err.errors
                        })
                    }

                    next(err)
                }
            })

            src.on('error', async() => {
                next(err)
            })

        } else {        
            let product = new Product(payload)
            await product.save()
        
            return res.json(product)
        }

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

const index = async(req, res, next) => {
    
    try {
        let { limit = 10, skip = 0 } = req.query
        
        // let products = await Product.find().limit(parseInt(limit)).skip(parseInt(skip))  
        // return res.json(products)

        let count = await Product.find().countDocuments()
        let products = await Product.find().paginate(limit, skip).select('-__v')

        return res.json({
            data: products,
            count
        })


    } catch(err) {
        next(err)
    }
}

const update = async(req, res, next) => {
    try {

        let policy = policyFor(req.user)
        if(policy.can('update', 'Product')) {
            res.json({
                error: 1,
                message: 'Anda tidak memilik akses untuk mengupdate Produk'
            })
        }

        let payload = req.body

        if(req.file) {
            let tmp_path = req.file.path
            let originalExt = req.file.originalname.split('.')
            [req.file.originalname.split('.').length - 1]

            let filename = req.file.filename + '.' + originalExt
            let target_path = path.resolve(config.rootPath, `public/upload/${filename}`)

            const src = fs.createReadStream(tmp_path)
            const dest = fs.createWriteStream(target_path)
            src.pipe(dest)

            src.on('end', async() => {
                try {
                    let product = await Product.findOne({ _id: req.params.id })
                    let currentImage = `${config.rootPath}/public/upload/${product.image_url}`

                    if(fs.existsSync(currentImage)) {
                        fs.unlinkSync(currentImage)
                    }

                    product = await Product
                                    .findOneAndUpdate(
                                        { _id: req.params.id },
                                        { ...payload, image_url: filename },
                                        { new: true, runValidators: true }
                                    )
                    
                    return res.json(product)

                } catch(err) {
                    // jika error hapus file yang sudah terupload pada direktori
                    fs.unlinkSync(target_path)

                    if(err && err.name === 'ValidationError') {
                        return res.json({
                            error: 1,
                            message: err.message,
                            fields: err.errors
                        })
                    }

                    next(err)
                }
            })

            src.on('error', async() => {
                next(err)
            })

        } else {        
            let product = await Product
                                .findOneAndUpdate(
                                    { _id: req.params.id },
                                    payload,
                                    { new: true, runValidators: true }
                                )
        
            return res.json(product)
        }

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

const destroy = async(req, res, next) => {
    try {

        let policy = policyFor(req.user) 
        if(!policy.can('delete', 'Product')) {
            return res.json({
                error: 1,
                message: 'Anda tidak memilik akses untuk menghapus Produk'
            })
        } 

        let product = await Product.findOneAndDelete({ _id: req.params.id })
        let currentImage = `${config.rootPath}/public/upload/${product.image_url}`

        if(fs.existsSync(currentImage)) {
            fs.unlinkSync(currentImage)
        }

        return res.json(product)

    } catch(err) {
        next(err)
    }
}

module.exports = {
    index,
    update,
    store,
    destroy
}