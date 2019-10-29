const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
require('mongoose-type-email');

var User = new Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    // represents if is system admin
    admin: {
        type: Boolean,
        default: false
    },
    //represents the state of the user
    active: {
        type: Boolean,
        default: false
    },
    tel: {
        type: String,
        default: ''
    },
    email: {
        type: mongoose.SchemaTypes.Email
    },
    favoritas: [{
        type: String
    }]
},
{
    timestamps: true
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);