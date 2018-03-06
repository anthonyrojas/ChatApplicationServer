const express = require('express');

const userController = require('./controllers/userController');
const authController = require('./controllers/authController');
const chatController = require('./controllers/chatController');

module.exports = (app)=>{
    const apiRoutes = express.Router();
    const chatRoutes = express.Router();
    apiRoutes.post('/register', userController.register, authController.generateKeys);
    apiRoutes.post('/login', authController.login);
    app.use('/api', apiRoutes);
    chatRoutes.post('/conversation', authController.loginRequired, userController.findUser, authController.getPublicKey, chatController.createConversation);//one-to-one new conversation
    chatRoutes.post('/conversation/group', authController.loginRequired, userController.findUsers, authController.getPublicKeys, chatController.createGroupConversation);//start a new conversation
    chatRoutes.get('/conversation/join', authController.loginRequired, chatController.joinConversation);//confirm to joining conversation
    chatRoutes.post('/message/send');//send a new message
    chatRoutes.get('/conversations/:phone', authController.loginRequired, chatController.getCoversations);//get all conversations from a user
    chatRoutes.get('/messages/:chat');//get all messages in a chat
    apiRoutes.use('/chat', chatRoutes);
}