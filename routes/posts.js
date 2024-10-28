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
    { isRead }, // Utiliser la valeur de isRead fournie dans le corps de la requête
    { new: true } // Renvoyer le document mis à jour
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

module.exports = router;