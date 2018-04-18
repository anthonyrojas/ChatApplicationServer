const express = require('express');

const userController = require('./controllers/userController');
const authController = require('./controllers/authController');
const chatController = require('./controllers/chatController');

module.exports = (app)=>{
    const apiRoutes = express.Router();
    const chatRoutes = express.Router();
    apiRoutes.post('/register', userController.register);
    apiRoutes.post('/login', authController.login);
    app.use('/api', apiRoutes);
    //one-to-one new conversation
    chatRoutes.post('/conversation', authController.loginRequired, userController.findUser, chatController.createConversation);
    //start a new group conversation
    chatRoutes.post('/conversation/group', authController.loginRequired, userController.findUsers, chatController.createGroupConversation);
    chatRoutes.get('/invitations', authController.loginRequired, chatController.getInvites);
    //confirm to joining a conversation
    chatRoutes.get('/:invite/join', authController.loginRequired, chatController.joinConversation);
    //send a new message
    chatRoutes.post('/:conversation/message', authController.loginRequired, chatController.sendMessage);
    //get all conversations from a user
    chatRoutes.get('/conversations', authController.loginRequired, chatController.getConversations);
    //get all messages in a conversation
    chatRoutes.get('/:conversation/messages', authController.loginRequired, chatController.getMessages);
    apiRoutes.use('/chat', chatRoutes);
}