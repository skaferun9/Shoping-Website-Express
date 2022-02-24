const User = require('../models/user');
const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');

exports.getLoginForm = (req, res, next) => {
    let message = req.flash('errorLogin');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('login',
        {
            isLoggedIn: req.session.isLoggedIn,
            path: '/',
            errorMessage: message
        }
    );
}

exports.postLoginForm = async (req, res, next) => {
    const { email, password } = req.body;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('errorLogin', 'No This User in Database');
                res.redirect('/login');
                return console.log('No User in Database');
            }
            bcrypt.compare(password, user.password)
                .then(result => {
                    if (result) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(msg => {
                            console.log(msg);
                            console.log('login success');
                            res.redirect('/');
                        })
                    }
                    req.flash('errorLogin', 'password incorecct');
                    console.log('password incorecct');
                    return res.redirect('/login');
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
}

exports.postLogout = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/');
    }
    req.session.destroy(msg => {
        console.log(msg);
    })
    res.redirect('/');
}

exports.getSingupForm = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/');
    }
    res.render("singup", {
        isLoggedIn: req.session.isLoggedIn,
        errorMessage: req.flash('errorSingup')
    })
}

exports.postSingupForm = (req, res, next) => {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('singup', {
            errorMessage: errors.array()[0].msg
        });
    }
    User.findOne({ email: email })
        .then(user => {
            if (user) {
                req.flash('errorSingup', 'this email is already');
                return res.redirect('/singup');
            }
            return bcrypt
                .hash(password, 12)
                .then(passHashed => {
                    const newUser = new User({
                        email: email,
                        password: passHashed,
                        cart: { item: [] }
                    })
                    return newUser.save();
                })
                .then(result => {
                    console.log("singup Complete");
                    res.redirect('/');
                })
        })
        .catch(err => console.log(err))
}