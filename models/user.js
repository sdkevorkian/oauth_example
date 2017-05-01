'use strict';
var bcrypt = require('bcrypt');
module.exports = function(sequelize, DataTypes) {
    var user = sequelize.define('user', {
        firstName: DataTypes.STRING,
        lastName: DataTypes.STRING,
        email: {
            type: DataTypes.STRING,
            validate: {
                isEmail: {
                    msg: 'please enter a valid email address'
                }
            }
        },
        password: {
            type: DataTypes.STRING,
            validate: {
                len: {
                    args: [4, 32],
                    msg: 'password must be between 4 and 32 characters long'
                }
            },
            isAlphanumeric: {
                msg: 'no special characters allowed in password'
            }
        },
        facebookId: DataTypes.STRING,
        facebookToken: DataTypes.STRING
    }, {
        // hooks are implemented each time, hooked to database
        hooks: {
            beforeCreate: function(user, options, cb) {
                if (user && user.password) {
                    var hash = bcrypt.hashSync(user.password, 10);
                    user.password = hash;
                    // this step happens before the password is saved!!!!!!!!!!!!
                }
                cb(null, user);
                // keep passing to next functions, new user creation in database was intercepted by hook
            }
        },
        classMethods: {
            associate: function(models) {
                // associations can be defined here
            }
        },
        instanceMethods: {
            // not run unless called on specific instance
            isValidPassword: function(passwordTyped) {
                console.log(bcrypt);
                return bcrypt.compareSync(passwordTyped, this.password);
            },
            toJSON: function() {
                var data = this.get();
                delete data.password;
                return data;
            },
            getFullName: function() {
                return this.firstName + ' ' + this.lastName;
            }
        }
    });
    return user;
};
