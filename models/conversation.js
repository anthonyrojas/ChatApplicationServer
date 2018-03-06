const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref:'User',
        required: true
    }],
    chatType: {
        type: String,
        enum: ['single', 'group'],
        required: true
    }, 
    created: {
        type: Date,
        default: Date.now,
        required: true
    }
});

module.exports = mongoose.model('Conversation', ConversationSchema);