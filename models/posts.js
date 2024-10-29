const mongoose = require('mongoose');


const postSchema = mongoose.Schema({
  title: String,
  content: String,
  images: [String], //plusieurs images possibles donc tableau
  creationDate: Date,
  author: { 
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'teachers', required: true }, 
    username: { type: String, required: true }, 
    firstname: { type: String, required: true } 
  },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'classes' }], //plusieurs classes concernées possibles donc tableau d'id classes
  isRead: Boolean,
});

const Post = mongoose.model('posts', postSchema);

module.exports = Post;