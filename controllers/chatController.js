const jwt = require('jsonwebtoken');
const Conversation = require('../models/conversation');
const User = require('../models/user');
const Message = require('../models/message');

exports.createConversation = (req, res, next)=>{
    let userFound = res.locals.userFound;
    let me = res.locals.me;
    let userKey = res.locals.userKey;
    let conversationUsers = [];
    conversationUsers.push(me._id);
    conversationUsers.push(userFound._id);
    var newConvo = new Conversation({
        participants: conversationUsers,
        chatType: 'single'
    });
    newConvo.save((err, savedConvo)=>{
        if(err){
            res.status(500).json({error: 'Failed to create this conversation.'});
        }else{
            res.status(200).json({message: 'New conversation started!', userKey: userKey.key});
        }
    });
}

exports.createGroupConversation = (req, res, next)=>{
    const me = res.locals.me;
    let conversationUsers = res.locals.usersFound.map(convoUser => convoUser._id);
    conversationUsers.push(me._id);
    const usersFound = res.locals.usersFound;
    const userKeys = res.locals.userKeys;
    var newConvo = new Conversation({
        participants: conversationUsers,
        chatType: 'group'
    });
    newConvo.save((err, savedConvo)=>{
        if(err){
            res.status(500).json({error: 'Could not create this conversation.'});
        }else{
            res.status(200).json({message: 'New conversation started!', userKeys: userKeys});
        }
    });
}

exports.joinConversation = (req, res, next)=>{
    if(!req.body.conversation){

    }
}

exports.getConversations = (req, res, next)=>{
    Conversation.find({users: res.locals.me._id}, (err, conversationsFound)=>{
        if(err){
            res.status(404).json({error: 'No users'});
        }
    });
}