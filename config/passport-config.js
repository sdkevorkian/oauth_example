var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var facebookStrategy = require('passport-facebook').Strategy;
var db = require('../models');

passport.serializeUser(function(user, cb) {
    cb(null, user.id);
    // first is error, then how we want to pass on the data
});

passport.deserializeUser(function(id, cb) {
    db.user.findById(id).then(function(user) {
        cb(null, user);
    }).catch(cb);
});

passport.use(new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, function(email, password, cb) {
    db.user.findOne({
        where: { email: email }
    }).then(function(user) {
        // want to detect if user is null (aka not found)
        // console.log(user.isValidPassword(password));
        if (!user || !user.isValidPassword(password)) {
            cb(null, false); // no user or bad password
        } else {
            cb(null, user); // user is allowed
        }
    }).catch(cb);
}));

passport.use(new facebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: process.env.BASE_URL + '/auth/callback/facebook',
    profileFields: ['id', 'email', 'displayName'], // get info from user via facebook instead of through form. this lets us get the info from facebook
    enableProof: true
}, function(accessToken, refresh, profile, cb) { //function passed into passport.use

    // grabs email from facebook (if exists, grabs first)
    var email = profile.emails ? profile.emails[0].value : null;

    // see if user exists in database
    db.user.findOne({
        where: { email: email }
    }).then(function(existingUser) {
        // if found, person has been here before, email is not null
        if (existingUser && email) {
            existingUser.updateAttributes({
                facebookId: profile.id, // this and accessToken are returned from facebookStraegy above)
                facebookToken: accessToken
            }).then(function(updatedUser) {
                cb(null, updatedUser);
            }).catch(cb);
        } else {
            // person hasnt been seen before, needs new entry in our database
            db.user.findOrCreate({
                where: { facebookId: profile.id },
                defaults: {
                    facebookToken: accessToken,
                    email: email,
                    firstName: profile.displayName.split(' ')[0],
                    lastName: profile.displayName.split(' ')[1]
                }
            }).spread(function(user, wasCreated) {
                console.log(profile.displayName);
                if (wasCreated) {
                    // they were new and were created
                    cb(null, user);
                } else {
                    // they were not new after all, just need to update token
                    user.FacebookToken = accessToken;
                    user.save().then(function() {
                        // save is alternative as opposed to ubdate attributes
                        cb(null, user);
                    });
                }

            }).catch(cb);
        }
    });

}));


module.exports = passport;
