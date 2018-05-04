const keypair = require('keypair');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config');

exports.login = (req, res, next)=>{
    if(!req.body.phone){
        res.status(400).json({error: 'You must enter your account\'s phone number.'});
    }
    if(!req.body.password){
        res.status(400).json({error: 'You must enter your account\'s password.'});
    }
    User.findOne({'phone': req.body.phone}, (err, userFound)=>{
        if(err){
            res.status(400).json({error: 'Account not found. Invalid phone number.'});
        }else{
            if(!userFound){
                res.status(404).json({error: 'Account not found. Invalid phone number.'});
            }else if(!userFound.comparePassword(req.body.password)){
                res.status(400).json({error: 'Wrong password.'});
            }else{
                res.status(200).json(
                    {
                        token: jwt.sign( {_id: userFound._id, phone: userFound.phone},config.secret),
                        userID: userFound._id,
                        privateKey: userFound.privateKey,
                        publicKey: userFound.publicKey
                    }
                );
            }
        }
    });
}

exports.loginRequired = (req, res, next)=>{
    if(!req.headers.authorization){
        res.status(422).json({error: 'Error! Not authenticated. Please reopen the app and login.'});
    }else{
        const tokenHeader = req.headers.authorization;
        jwt.verify(tokenHeader, config.secret, (err,decoded)=>{
            if(err){
                res.status(422).json({error: err.message});
                //res.status(422).json({error: 'It seems your sign-in token has been tampered with. Please log out and sign in again.'});
            }else{
                User.findOne({phone: decoded.phone}, (err, userFound)=>{
                    if(err){
                        res.status(404).json({error: 'Could not find you in the database. Please log out and sign in again.'});
                    }else{
                        res.locals.me = userFound;
                        next();
                    }
                });
            }
        });
    }
}