const isAuth = require('../middleware/is-auth');
const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');

router.get('/', shopController.getMainShop);

router.get('/product/:productId', shopController.getProductById);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart/:productId', isAuth, shopController.addCart);

router.post('/delete-cart/:productId', isAuth, shopController.deleteCartItem);

router.post('/create-order', isAuth, shopController.createOrder);

router.get('/order', isAuth, shopController.getMyOrder);

router.get('/my-product', isAuth, shopController.getMyProduct);

router.get('/order/:orderId', isAuth, shopController.getOrderInvoice);

router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/checkout/success', isAuth, shopController.getCheckoutSuccess);

router.get('/checkout/cencel', isAuth, shopController.getCheckout);


module.exports = router;