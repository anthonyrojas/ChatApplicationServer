const config = require('../config');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const emailValidator = require('email-validator');
const keypair = require('keypair');
const User = require('../models/user');
const NumberValidation = require('phone-number-validation');
const phoneValidator = new NumberValidation({
    access_key: config.phoneValidatorKey
});

exports.register = (req, res, next)=>{
    let errorExists = false;
    if(!req.body.phone){
        errorExists = true;
        res.status(422).json({message: 'You must enter a phone.'});
    }
    if(!req.body.email){
        errorExists = true;
        res.status(422).json({message: 'You must enter an email.'});
    }
    if(!req.body.firstName){
        errorExists = true;
        res.status(422).json({message: 'You must enter your first name.'});
    }
    if(!req.body.lastName){
        errorExists = true;
        res.status(422).json({message: 'You must enter your last name.'});
    }
    if(!req.body.password){
        errorExists = true;
        res.status(422).json({message: 'You must enter a password.'});        
    }
    if(!errorExists){
        User.findOne({phone: req.body.phone}, (err, userFound)=>{
            if(err){
                res.status(422).json({message: 'A user with that phone number exists. Use a different phone number.'});
            }else{
                phoneValidator.validate({number: req.body.phone}, (phoneErr, numRes)=>{
                    if(phoneErr){
                        res.status(422).json({message: 'Error validating phone number. Please try again in a while.'});
                    }else{
                        if(numRes.valid){
                            const keys = keypair();
                            const salt = bcrypt.genSaltSync(12);
                            const hashPassword = bcrypt.hashSync(req.body.password, salt);
                            var newUser = new User({
                                phone: req.body.phone,
                                email: req.body.email,
                                firstName: req.body.firstName,
                                lastName: req.body.lastName,
                                password: hashPassword,
                                publicKey: keys.public,
                                privateKey: keys.private
                            });
                            newUser.save((err, savedUser)=>{
                                if(err){
                                    res.status(422).json({message: 'Could not create user at this time. Please try again later.'});
                                }else{
                                    savedUser.password = undefined;
                                    res.json({message: 'Registered successfully!', user: savedUser, privateKey: keys.private});
                                }
                            });
                        }else{
                            res.status(422).json({message: 'Invalid phone number. Make sure you enter a valid, active number.'});
                        }
                    }
                });
            }
        });
    }
}

exports.findUser = (req, res, next)=>{
    if(!req.body.phone){
        res.status(400).json({error: 'You must enter a valid phone number.'});        
    }else{
        if(req.body.phone === res.locals.me.phone){
            res.status(400).json({error: 'You cannot start a conversation with yourself.'});
        }else{
            User.findOne({phone: req.body.phone}, (err, userFound)=>{
                if(err){
                    return res.status(404).json({error: `User with ${req.body.phone} not found. Please make sure to include the contry call code and area code. (Ex: 13231234567)`});
                }else{
                    res.locals.userFound = userFound;
                    next();
                }
            });
        }
    }
}

exports.findUsers = (req, res, next)=>{
    if(!req.body.phones){
        res.status(400).json({error: 'You must enter a valid phone number.'});
    }else{
        Promise.all(req.body.phones.map(phone=>{
            return User.findOne({phone: phone}).exec();
        })).then(usersFound => {
            //usersFound = usersFound.filter(phone => phone !== null);
            let containsNull = usersFound.some(u=>{
                return u === null;
            });
            if(containsNull){
                res.status(404).json('One or more users not found. Make sure to enter country code with area code. (Ex for USA: 13231234567');
            }else{
                res.locals.usersFound = usersFound;
                next();
            }
        }).catch(error =>{
            res.status(404).json({error: 'One or more users not found.'});
        });
    }
}