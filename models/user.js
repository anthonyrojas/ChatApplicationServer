const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

const UserSchema = new Schema({
    phone:{
        type: String,
        required: true,
        unique: true
    },
    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    publicKey: {
        type: String,
        required: true
    },
    privateKey:{
        type: String,
        required: true
    },
    created:{
        type: Date,
        required: true,
        default: Date.now
    }
});

UserSchema.methods.comparePassword = function(password){
    return bcrypt.compareSync(password, this.password);
};


module.exports = mongoose.model('User', UserSchema);