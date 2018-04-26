const jwt = require('jsonwebtoken');
const Conversation = require('../models/conversation');
const User = require('../models/user');
const Message = require('../models/message');
const Invitation = require('../models/invitation');

exports.createConversation = (req, res, next)=>{
    let userFound = res.locals.userFound;
    let me = res.locals.me;
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
            /*var invite = new Invitation({
                conversation: savedConvo._id,
                sendTo: userFound._id,
                created: savedConvo.created
            });
            invite.save((inviteErr, savedInvite)=>{
                if(err){
                    return res.status(500).json({error: 'Failed to notify users of new conversation.'});
                }
            });*/
            res.status(200).json({message: 'New conversation started!', user: userFound});
        }
    });
}

// TODO: fix invites in group chat, it is sending to creator of conversation too
exports.createGroupConversation = (req, res, next)=>{
    const usersFound = res.locals.usersFound;
    const me = res.locals.me;
    let conversationUsers = usersFound;
    conversationUsers.push(me);
    var newConvo = new Conversation({
        participants: conversationUsers,
        chatType: 'group'
    });
    newConvo.save((err, savedConvo)=>{
        if(err){
            res.status(500).json({error: 'Could not create this conversation.'});
        }else{
            /*conversationUsers = conversationUsers.filter(val => val._id != me._id);
            res.locals.usersFound = res.locals.usersFound.filter(val => val._id != me._id);
            res.locals.usersFound.forEach(u => {
                let invite = new Invitation({
                    conversation: savedConvo,
                    sendTo: u
                });
                invite.save((inviteErr, savedInvite)=>{
                    if(inviteErr){
                        return res.status(500).json({error: 'Failed to notify users of new conversation.'});
                    }
                });
            });*/
            res.status(200).json({message: 'New conversation started!', users: res.locals.usersFound});
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
    if(!req.params.invite){
        res.status(400).json({error: 'You must specify the conversation.'});
    }else{
        Invitation.findOneAndRemove({_id: req.params.invite}).populate({
            path: 'conversation',
            model: 'Conversation',
            populate:{
                path: 'participants',
                model: 'User'
            }
        }).exec((err, foundInvite)=>{
            if(err){
                res.status(404).json({error: 'Could not find conversation asssociated with this inivite.'});
            }else{
                res.status(200).json({message:'Welcome to the conversation!', invite: foundInvite});
            }
        });
    }
}

exports.getConversations = (req, res, next)=>{
    Conversation.find({participants: res.locals.me._id}).populate('participants').exec((err, conversationsFound)=>{
        if(err){
            res.status(404).json({error: 'No conversations'});
        }else{
            res.status(200).json({conversations: conversationsFound});
        }
    });
    /*Conversation.find({participants: res.locals.me._id}, (err, conversationsFound)=>{
        if(err){
            res.status(404).json({error: 'No users'});
        }else{
            res.status(200).json({conversations: conversationsFound});
            
        }
    });*/
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

exports.getPublicKeys = (req, res, next)=>{
    Conversation.findOne({_id: req.params.conversation}).populate('participants').exec((err, convo)=>{
        if(err){
            res.status(404).json({error: 'No users found in this conversation'});
        }else{
            let convoUsers = convo.participants.filter(u=> u._id !== res.locals.me._id);
            res.status(200).json({users: convoUsers});
        }
    });
}