const jwt = require('jsonwebtoken');
const Conversation = require('../models/conversation');
const User = require('../models/user');
const Message = require('../models/message');
const Invitation = require('../models/invitation');

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
            var invite = new Invitation({
                conversation: savedConvo._id,
                sendTo: userFound._id,
                created: savedConvo.created
            });
            invite.save((inviteErr, savedInvite)=>{
                if(err){
                    return res.status(500).json({error: 'Failed to notify users of new conversation.'});
                }
            });
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
            usersFound.forEach(u => {
                let invite = new Invitation({
                    conversation: savedConvo,
                    sender: me,
                    sendTo: u
                });
                invite.save((inviteErr, savedInvite)=>{
                    if(inviteErr){
                        return res.status(500).json({error: 'Failed to notify users of new conversation.'});
                    }
                });
            });
            res.status(200).json({message: 'New conversation started!', userKeys: userKeys});
        }
    });
}

exports.getInvites = (req, res, next)=>{
    Invitation.find({sendTo: res.locals.me}, (err, invites)=>{
        if(err){
            res.status(404).json({error: 'No invites found.'});
        }else if(invites.length === 0){
            res.status(404).json({error: 'No invites found.'});
        }else{
            res.status(200).json({message: `You have ${invites.length} new chats to acknowledge.`, invites: invites});
        }
    });
}

exports.joinConversation = (req, res, next)=>{
    if(!req.params.conversation){
        res.status(400).json({error: 'You must specify the conversation.'});
    }else{
        console.log(req.params.conversation);
        Conversation.findOne({_id: req.params.conversation}, (err, foundConvo)=>{
            if(err){
                res.status(404).json({error: 'Could not join this conversation.'});
            }else{
                res.json({convo: foundConvo});
            }
        });
    }
}

exports.getConversations = (req, res, next)=>{
    Conversation.find({participants: res.locals.me._id}, (err, conversationsFound)=>{
        if(err){
            res.status(404).json({error: 'No users'});
        }else{
            res.status(200).json({conversations: conversationsFound});
        }
    });
}

exports.sendMessage = (req, res, next)=>{
    if(!req.body.content){
        res.status(400).json({error: 'You must enter message content.'});
    }else{
        var newMessage = new Message({
            sender: res.locals.me,
            conversation: req.params.conversation,
            content: req.body.content
        });
        newMessage.save((err, savedMessage)=>{
            if(err){
                res.status(500).json({error: 'Unable to send message.'});
            }else{
                res.status(200).json({message: savedMessage});
            }
        });
    }
}

exports.getMessages = (req, res, next)=>{
    Message.find({conversation: req.params.conversation}).populate('sender').exec((err, messages)=>{
        if(err){
            res.status(404).json({error: 'No messages in this conversation'});
        }else{
            res.status(200).json({messages: messages});
        }
    });
}