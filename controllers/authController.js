const PubKey = require('../models/pubKey');
const keypair = require('keypair');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config');

exports.generateKeys = (req, res, next)=>{
    const keys = keypair();
    const publicKey = keys.public;
    const privateKey = keys.private;
    const userID = res.locals.user._id;
    const newUserKey = new PubKey({
        user: userID,
        key: publicKey
    });
    newUserKey.save((err, savedKey)=>{
        if(err){
            res.status(422).json({message: 'Failed to generate keys for new user.'});
        }else{
            res.status(200).json({message: 'Congratulations! Registration successful!', publicKey: publicKey, privateKey: privateKey});
        }
    });
}

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
            if(!userFound.comparePassword(req.body.password)){
                res.status(400).json({error: 'Wrong password.'});
            }else{
                res.status(200).json({token: jwt.sign( {_id: userFound._id, phone: userFound.phone, firstName: userFound.firstName, email: userFound.email},config.secret)});
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
                res.status(422).json({error: 'It seems your sign-in token has been tampered with. Please log out and sign in again.'});
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

exports.getPublicKey = (req, res, next)=>{
    const userFound = res.locals.userFound;
    PubKey.findOne({user: userFound._id}).populate('user').exec((err, currentKey)=>{
        if(err){
            return res.status(404).json({error: 'Could not find the user\'s key.'});
        }else{
            res.locals.userKey = currentKey;
            next();
        }
    });
}

exports.getPublicKeys = (req, res, next)=>{
    const usersFound = res.locals.usersFound;
    //let userKeys = [];
    //console.log(usersFound);
    Promise.all(res.locals.usersFound.map(userFound=>{
        return PubKey.findOne({user: userFound._id}).exec();
    })).then(userKeys =>{
        let containsNull = userKeys.some(k=>{
            return k === null;
        });
        if(containsNull){
            res.status(400).json({error: 'One or more user keys not found.'});
        }else{
            res.locals.userKeys = userKeys;
            next();
        }
    }).catch(error =>{
        res.status(500).json({error: 'Could not retreive certain user\'s keys.'});
    });
    //usersFound.forEach(userFound => {
        /*PubKey.findOne({user: {$in: usersFound._id}}).populate('user').exec((err, currentKey)=>{
            console.log('populating ...');
            if(err){
                return res.status(404).json({error: 'Could not find user\'s key.'});
            }else{
                userKeys.push(currentKey);
            } 
        });*/
    //});
    //res.locals.userKeys = userKeys;
    //next();
}

exports.sendPublicKey = (req, res, next)=>{
}