const fs = require('fs');
const path = require('path');
const Product = require('../models/product');
const Order = require('../models/order');
const itemPerPage = 3;
const stripe = require("stripe")(process.env.STRIPE_APIKEY)

exports.getMainShop = (req, res, next) => {
    let page = req.query.page || 1
    let totalItem
    // if (!page) {
    //     page = 1;
    // }
    page = parseInt(page)
    Product.find()
        .countDocuments()
        .then(numProducts => {
            totalItem = numProducts
            return Product.find()
                .skip((page - 1) * itemPerPage)
                .limit(itemPerPage)
        })
        .catch(err => console.log(err))
        .then(products => {
            res.render('main',
                {
                    props: products,
                    pageTitle: 'Main',
                    isLoggedIn: req.session.isLoggedIn,
                    path: '/',
                    totalProduct: totalItem,
                    currentPage: page,
                    hasNextPage: itemPerPage * page < totalItem,
                    hasPrevPage: page > 1,
                    nextPage: page + 1,
                    prevPage: page - 1,
                    lastPage: Math.ceil(totalItem / itemPerPage)
                })

        })
        .catch(err => console.log(err))

}

exports.getProductById = (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId)
        .then(product => {
            console.log(product)
            res.render('productDetail',
                {
                    isLoggedIn: req.session.isLoggedIn,
                    props: product,
                    pageTitle: 'Main',
                    path: '/'
                })
        })
        .catch((err) => {
            console.log(err)
        })

}

exports.getCart = (req, res, next) => {

    req.user
        .populate('cart.item.productId')
        .then(user => {
            console.log(user.cart.item)
            products = user.cart.item
            res.render('myCart',
                {

                    isLoggedIn: req.session.isLoggedIn,
                    props: products,
                    pageTitle: 'Main',
                    path: '/'
                })
        })
        .catch(err => console.log(err))


}

exports.addCart = (req, res, next) => {

    const productId = req.params.productId;
    Product.findById(productId)
        .then(product => {

            return req.user.addToCart(product)
        })
        .then(result => {
            console.log(result)
            res.redirect('/')
        })
        .catch(err => console.log(err))
}

exports.getMyOrder = (req, res, next) => {

    Order
        .find({ 'orderBy.userId': req.user._id })
        .then(order => {
            res.render('myOrder',
                {
                    isLoggedIn: req.session.isLoggedIn,
                    props: order,
                    pageTitle: 'myOrder',
                    path: '/'
                })
        })
        .catch(err => console.log(err))
}

exports.deleteCartItem = (req, res, next) => {

    const productId = req.params.productId;
    req.user.deletePdFromCart(productId)
    res.redirect('/cart')
}

exports.createOrder = (req, res, next) => {

    req.user.populate('cart.item.productId')
        .then(user => {
            const order = new Order({
                orderBy: {
                    userId: user._id,
                    email: user.email
                },
                item: user.cart.item
            })
            req.user.clearCart()
            return order.save()
        })
        .then(result => {
            res.redirect('/cart')
        })
        .catch(err => console.log(err))




}

exports.getMyProduct = (req, res, next) => {
    console.log(req.user._id)
    Product.find({ userId: req.user._id })
        .then(products => {
            res.render('myProduct', {
                props: products,
                pageTitle: "My Product"
            })
        })
        .catch(err => console.log(err))
}


exports.getOrderInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    const invoiceName = 'invoice-' + orderId + '.pdf'
    const invoicePath = path.join('data', 'invoice', invoiceName)
    Order.findById(orderId)
        .then(order => {
            if (!order) {
                console.log('no this order')
                return res.redirect('/')
            }
            if (order.orderBy.userId.toString() != req.user._id.toString()) {
                console.log('not your order')
                return res.redirect('/')
            }
            // fs.readFile(invoicePath, (err, data) => {
            //     if (err) {
            //         return err;
            //     }
            //     res.setHeader('Content-Type', 'application/pdf')
            //     res.setHeader('Content-Disposition', "attachment; filename='" + invoiceName + '"')
            //     return res.send(data);
            // })
            const file = fs.createReadStream(invoicePath);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                'inline; filename="' + invoiceName + '"'
            )
            file.pipe(res)
        })
        .catch(err => console.log(err))

}


exports.getCheckout = (req, res, next) => {
    let products
    let total = 0;
    req.user
        .populate('cart.item.productId')
        .then(user => {
            products = user.cart.item;
            let total = 0;
            products.forEach(p => {
                total += p.quantity * p.productId.price
            })
            return stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: products.map(p => {
                    return {
                        name: p.productId.title,
                        description: p.productId.description,
                        amount: p.productId.price * 100,
                        currency: 'usd',
                        quantity: p.quantity
                    }
                }),
                success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
                cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
            })



        })
        .then(session => {
            console.log(session)
            res.render('checkout', {
                products: products,
                totalSum: total,
                sessionId: session
            })
        })
        .catch(err => console.log(err))
}

exports.getCheckoutSuccess = (req, res, next) => {
    req.user.populate('cart.item.productId')
        .then(user => {
            const order = new Order({
                orderBy: {
                    userId: user._id,
                    email: user.email
                },
                item: user.cart.item
            })
            req.user.clearCart()
            return order.save()
        })
        .then(result => {
            res.redirect('/cart')
        })
        .catch(err => console.log(err))
}


