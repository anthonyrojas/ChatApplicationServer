const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const logger = require('morgan');
const config = require('./config');
const routes = require('./routes');

mongoose.Promise = global.Promise;
mongoose.connect(config.database);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//enable CORS
app.use((req, res, next)=>{
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

app.use(logger('dev'));

const server = app.listen(3000, ()=>{
    console.log('Listening on port 3000');
});

const io = require('socket.io').listen(server);
const socketEvents = require('./socketEvents');
socketEvents(io);

routes(app);

app.use((err, req, res, next)=>{
    res.status(500).json({error: 'Server error!'});
});