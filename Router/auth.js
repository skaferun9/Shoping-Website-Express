const express = require('express');
const router = express.Router();
const { check, body } = require('express-validator/check');
const authController = require('../controllers/authController');

router.get('/login', authController.getLoginForm);

router.post('/login', body('email', 'pls enter valid email')
    .trim()
    .isEmail()
    .normalizeEmail()
    , authController.postLoginForm);

router.post('/logout', authController.postLogout);

router.get('/singup', authController.getSingupForm);

router.post('/singup', [check('email')
    .isEmail()
    .normalizeEmail()
    .trim()
    .withMessage('Please enter a valid Email'),
body(
    'password',
    'pls only text and number and more 5 text')
    .trim()
    .isLength({ min: 5 })
    .isAlphanumeric(),
body('confirmPass')
    .trim()
    .custom((value, { req }) => {
        if (req.body.password != value) {
            throw new Error('password no match!')
        }
        return true
    })
], authController.postSingupForm);

module.exports = router;
