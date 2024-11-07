const mongoose = require('mongoose');


const postSchema = mongoose.Schema({
  title: String,
  content: String,
  images: [String], //plusieurs images possibles donc tableau
  creationDate: Date,
  author: { 
    token: { type: String, ref: 'teachers', required: true }, 
    username: { type: String, required: true }, 
    firstname: { type: String, required: true } 
  },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'classes' }], //plusieurs classes concernées possibles donc tableau d'id classes
  isRead: Boolean,
  cloudinaryId: String,
});

const Post = mongoose.model('posts', postSchema);

module.exports = Post;