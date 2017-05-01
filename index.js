require('dotenv').config();
var express = require('express');
var ejsLayouts = require('express-ejs-layouts');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
var passport = require('./config/passport-config');
var isLoggedIn = require('./middleware/isLoggedIn'); // put this on routes we want to protect

var app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(ejsLayouts);
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveuninitialized: true
}));

// depends on session, ensure it is below
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
    res.locals.alerts = req.flash();
    res.locals.currentUser = req.user;
    next();
});
// Routes
app.get('/', function(req, res) {
    res.render('home');
});


app.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile');
});

// Controllers
app.use('/auth', require('./controllers/auth'));


// Listen
app.listen(3000);
