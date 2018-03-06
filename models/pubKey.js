const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PubKeySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    key: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('PubKey', PubKeySchema);