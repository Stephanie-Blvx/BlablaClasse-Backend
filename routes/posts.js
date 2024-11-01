var express = require('express');
var router = express.Router();
require('../models/connection');
const Post = require('../models/posts');

// route pour récupérer tous les messages.
router.get('/', (req, res) => {
    Post.find({}).then(data => {
      if (data) {
        res.json({ result: true, posts: data});
      } else {
        res.json({ result: false, error: 'No posts Found' });
      }
    });
  });

  router.get('/:id', (req, res) => {
    Post.find({}).then(data => {
      if (data) {
        res.json({ result: true, posts: data});
      } else {
        res.json({ result: false, error: 'No posts Found' });
      }
    });
  });

// route pour mettre à jour l'état de isRead (checkBox)
router.put('/:id', (req, res) => {
  const postId = req.params.id;
  const { isRead, content } = req.body;

  // Préparer l'objet de mise à jour avec uniquement les champs fournis
  const updateFields = {};
  if (isRead !== undefined) updateFields.isRead = isRead;
  if (content !== undefined) updateFields.content = content;

  // Vérification qu'au moins un champ est fourni
  if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ success: false, error: 'rien à mettre à jour.' });
  }

  // Mise à jour du post en fonction des champs fournis
  Post.findByIdAndUpdate(
      postId,
      updateFields,
      { new: true }  
  )
  .then(updatedPost => {
      if (updatedPost) {
          res.json({ success: true, post: updatedPost }); // Retourner le post mis à jour
      } else {
          res.status(404).json({ success: false, error: 'Post not found' }); // Post non trouvé
      }
  })
});

// Route DELETE pour supprimer un post par son id
router.delete('/:id', (req, res) => {
  const postId = req.params.id;

  Post.findByIdAndDelete(postId)
      .then(deletedPost => {
          if (deletedPost) {
              res.json({ success: true, message: 'Post deleted successfully', post: deletedPost });
          } else {
              res.status(404).json({ success: false, error: 'Post not found' });
          }
      })
});

// Route POST pour créer un nouveau post
router.post('/', (req, res) => {
  const { title, content, author, images } = req.body;

  if (!title || !content || !author) {
      return res.status(400).json({ success: false, error: 'Title, content, and author are required' });
  }

  const newPost = new Post({
      title,
      content,
      author,
      images: images || [],  
      creationDate: new Date(),
      isRead: false,        
  });

  newPost.save()
      .then(savedPost => {
          res.json({ success: true, post: savedPost });
      })
});


module.exports = router;