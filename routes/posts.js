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
  const { isRead } = req.body;

  // Vérification si isRead est fourni
  if (isRead === undefined) {
      return res.status(400).json({ success: false, error: 'isRead must be provided' });
  }

  Post.findByIdAndUpdate(
    postId,
    { isRead }, 
    { new: true } 
)
.then(updatedPost => {
    if (updatedPost) {
        res.json({ success: true, post: updatedPost }); // Retourner le post mis à jour
    } else {
        res.status(404).json({ success: false, error: 'Post not found' }); // Post non trouvé
    }
})
.catch(err => {
    res.status(500).json({ success: false, error: 'Server error', details: err.message }); // Gérer les erreurs
});
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
      images: images || [],  // par défaut à un tableau vide si non fourni
      creationDate: new Date(),
      isRead: false,        
  });

  newPost.save()
      .then(savedPost => {
          res.json({ success: true, post: savedPost });
      })
});


module.exports = router;