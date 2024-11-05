const mongoose = require('mongoose');

const messagesSchema = mongoose.Schema({
    text: String,
    username: String,
    userType: String, // 'parent' ou 'teacher'
    createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model('messages', messagesSchema);

module.exports = Message;