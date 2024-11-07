var express = require('express');
var router = express.Router();
const cloudinary = require('cloudinary').v2;
const uniqid = require('uniqid');
const fs = require('fs');
const Post = require('../models/posts')


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
          res.json({ success: true, post: updatedPost });
      } else {
          res.status(404).json({ success: false, error: 'Post not found' });
      }
  })
});

router.delete('/:id', (req, res) => {
  const postId = req.params.id;

  Post.findById(postId)
      .then(deletedPost => {
          if (!deletedPost) {
              return res.status(404).json({ success: false, error: 'Post not found' });
          }

          // Vérifier s'il y a une image à supprimer
          if (deletedPost.images && deletedPost.images.length > 0) {
              const cloudinaryId = deletedPost.cloudinaryId; // Assurez-vous que cloudinaryId est stocké dans votre modèle

              // Supprimer l'image de Cloudinary
              return cloudinary.uploader.destroy(cloudinaryId)
                  .then(() => {
                      console.log('Image supprimée de Cloudinary:', cloudinaryId);
                      // Supprimer le post de la base de données après avoir supprimé l'image
                      return Post.findByIdAndDelete(postId);
                  });
          } else {
              // Si pas d'image, supprimer directement le post
              return Post.findByIdAndDelete(postId);
          }
      })
      .then(() => {
          res.json({ success: true, message: 'Post deleted successfully' });
      })
      .catch(error => {
          console.error('Erreur lors de la suppression du post:', error);
          return res.status(500).json({ success: false, error: error.message });
      });
});


// route pour ajouter un post avec ou sans image.
router.post('/', async (req, res) => {
  try {
    const { title, content, author } = req.body;
    let imageUrl = null;

    // Vérifiez si une image a été fournie
    if (req.files && req.files.photoFromFront) {
      const imagePath = req.files.photoFromFront.tempFilePath;

      // Upload de l'image sur Cloudinary
      const resultCloudinary = await cloudinary.uploader.upload(imagePath, {
        folder: 'PostsImages', // Dossier sur Cloudinary
      });

      console.log('Image uploadée sur Cloudinary:', resultCloudinary.secure_url);

      // Récupérer l'URL de l'image uploadée
      imageUrl = resultCloudinary.secure_url;

      // Supprimer le fichier temporaire après l'upload
      fs.unlinkSync(imagePath);
    }

    // Création du post avec ou sans image
    const newPost = new Post({
      title,
      content,
      author: JSON.parse(author),
      images: imageUrl ? [imageUrl] : [], 
      cloudinaryId: imageUrl ? resultCloudinary.public_id : null, 
      creationDate: new Date(),
      isRead: false,
    });

    // Sauvegarder le post dans la base de données
    const savedPost = await newPost.save();


    res.json({ success: true, post: savedPost });

  } catch (error) {
    console.error('Erreur lors de l\'ajout du post:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});
         


module.exports = router;