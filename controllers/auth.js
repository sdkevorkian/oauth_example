var express = require('express');
// calls local strategy
var passport = require('../config/passport-config');

var db = require('../models');
var router = express.Router();

// Routes
router.get('/login', function(req, res) {
    res.render('loginForm');
});

// passport will handle req/res function
router.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    successFlash: 'Good job, you logged in. Woo!',
    failureRedirect: '/auth/login',
    failureFlash: 'Try again, loser.'
}));

router.get('/signup', function(req, res) {
    res.render('signupForm');
});

// next is the call back function, common in middlewear
router.post('/signup', function(req, res, next) {
    db.user.findOrCreate({
        where: { email: req.body.email },
        defaults: {
            'firstName': req.body.firstName,
            'lastName': req.body.lastName,
            'password': req.body.password
        }
    }).spread(function(user, wasCreated) { //spreading into result and boolean
        if (wasCreated) {
            //good
            passport.authenticate('local', {
                successRedirect: '/profile',
                successFlash: 'Account created and logged in!',
                failureRedirect: '/login',
                failureFlash: 'unknown error occured, please relogin'
            })(req, res, next); // returns function that is then called with req, res, and next
        } else {
            //BAD!
            req.flash('error', 'email already exists please log in');
            res.redirect('/auth/login');
        }
    }).catch(function(error) {
        req.flash('error', error.message); //comes up with validations
        res.redirect('/auth/signup');
    });
});

router.get('/logout', function(req, res) {
    req.logout();
    req.flash('success', 'you logged out see you later');
    res.redirect('/');
});

// FACEBOOK  AUTH
// send request to facebook
router.get('/facebook', passport.authenticate('facebook', {
    scope: ['public_profile', 'email']
}));

// get response from facebook
router.get('/callback/facebook', passport.authenticate('facebook', {
    successRedirect: '/profile',
    successFlash: 'you have logged in with Facebook',
    failureRedirect: '/auth/login',
    failureFlash: 'you tried, but Facebook said no'
}));

// Exports object
module.exports = router;
