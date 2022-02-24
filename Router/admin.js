const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth');
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');

router.get("/add-product", isAuth, adminController.getAddProduct);

router.post('/add-product',
    [
        body('title')
            .isLength({ min: 3 })
        ,
        body('price').isFloat(),
        body('description').trim()

    ]
    , isAuth, adminController.postAddProduct);

router.get('/update-product/:productId', isAuth, adminController.getUpdateProduct);

router.post('/update-product/:productId',
    [
        body('updateTitle')
            .isLength({ min: 3 })
        ,
        body('updatePrice').isFloat(),
        body('updateDescription').trim()

    ], isAuth, adminController.postUpdateProduct);

router.post('/delete-product/:productId', isAuth, adminController.postDeleteProduct);



exports.router = router;
