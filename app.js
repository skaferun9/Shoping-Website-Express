const express = require('express');
require('dotenv').config()
const path = require('path');
const mongoose = require('mongoose');
const shopRouter = require('./Router/shop');
const adminRouter = require('./Router/admin');
const authRouter = require('./Router/auth');
const errorController = require('./controllers/errorController');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const multer = require('multer');
const csrf = require('csurf');
const csrtProtection = csrf()
const flash = require('connect-flash');
const User = require('./models/user');
const app = express();
const mongodbUri = process.env.MONGODB_URI;

const fileStroge = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './images')
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getHours() + '-' + new Date().getMinutes()
      + '-' + new Date().getSeconds() + '-' + file.originalname)
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true)
  } else {
    cb(null, false)
  }
};

const store = new MongoDBStore({
  uri: mongodbUri,
  collection: 'session'
});
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(multer({ storage: fileStroge, fileFilter: fileFilter }).single('img'));
app.use(express.static(path.join(__dirname, "public")));
app.use('/images', express.static(path.join(__dirname, "images")));
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(session({
  secret: 'timtamgo',
  resave: false,
  saveUninitialized: false,
  store: store
}));
app.use(csrtProtection);
app.use(flash());
app.use((req, res, next) => {
  if (!req.session.user) {
    return next()
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err))
});

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use(shopRouter);
app.use('/admin', adminRouter.router);
app.use(authRouter);
app.use(errorController.get404);

mongoose
  .connect(mongodbUri)
  .then(result => {
    app.listen(4000, () => {
      console.log(`🚀 Server ready at http://localhost:4000`);
    });
  })
  .catch(err => console.log(err))





