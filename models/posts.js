const mongoose = require('mongoose');


const postSchema = mongoose.Schema({
  title: String,
  content: String,
  images: [String], //plusieurs images possibles donc tableau
  creationDate: Date,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'teachers' },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'classes' }], //plusieurs classes concernées possibles donc tableau d'id classes
  isRead: Boolean,
});

const Post = mongoose.model('posts', postSchema);

module.exports = Post;