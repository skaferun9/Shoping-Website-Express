const mongodb = require('mongodb');
const { validationResult } = require('express-validator');
const product = require('../models/product');
const Product = require('../models/product');
const fileHalper = require('../util/file');

exports.getAddProduct = (req, res, next) => {
    res.render('add-product', {
        pageTitle: 'Add-product',
        path: '/admin/add-product',
        isLoggedIn: req.session.isLoggedIn,
        errorMessage: null
    })
}

exports.postAddProduct = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('add-product', {
            errorMessage: errors.array()[0].msg
        });
    }
    const { title, price, description } = req.body;
    const img = req.file;
    const imgUrl = img.path;
    const product = new Product({
        title: title,
        price: price,
        description: description,
        imgUrl: imgUrl,
        userId: req.user,
    });
    try {
        await product.save();
    } catch (err) {
        console.log(err);
        res.status(400);
    }

    return res.redirect('/');
}


exports.getUpdateProduct = async (req, res, next) => {
    const productId = req.params.productId;
    try {
        const product = await Product.findById(productId);
        res.render('update-product',
            {
                isLoggedIn: req.session.isLoggedIn,
                props: product,
                path: '/',
                errorMessage: null
            }
        );
    } catch (err) {
        console.log(err);
        res.status(400);
    }

}


exports.postUpdateProduct = (req, res, next) => {
    const errors = validationResult(req);
    const { updateTitle, updatePrice, updateDescription } = req.body;
    const img = req.file;
    const productId = req.params.productId;
    product.findById(productId)
        .then(product => {
        if (!errors.isEmpty()) {
            return res.status(422).render('update-product', {
                errorMessage: errors.array()[0].msg,
                props: product
            });
        }
        if (product.userId.toString() != req.user._id.toString()) {
            return res.redirect('/');
        }

        product.title = updateTitle;
        product.price = updatePrice;
        product.description = updateDescription;
        if (img) {
            fileHalper.deleteFile(product.imgUrl);
            product.imgUrl = img.path;
        }
        return product.save().then(result => {
            console.log(result);
            res.redirect('/');
        })
    })

        .catch(err => console.log(err));

}

exports.postDeleteProduct = async (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId)
        .then(product => {
            if (!product) {
                console.log('no this product!')
                return res.redirect('/')
            }
            fileHalper.deleteFile(product.imgUrl)
            return Product.deleteOne({ _id: productId, userId: req.user._id })
                .then(() => {
                    res.redirect('/')
                })
                .catch(err => console.log(err))
        })
        .catch(err => {
            console.log(err)
        })

}