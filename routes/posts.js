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
    if (!req.files || !req.files.photoFromFront) {
      return res.status(400).json({ result: false, error: 'Aucune image envoyée.' });
    }

    const postImage = `./tmp/${uniqid()}.jpg`; // Changer l'extension selon le format de l'image
    const resultMove = await req.files.photoFromFront.mv(postImage);

    if (resultMove) {
      // Si le déplacement du fichier a échoué
      return res.status(500).json({ result: false, error: 'Erreur lors du déplacement du fichier.' });
    }

    // Envoi de l'image vers Cloudinary
    const resultCloudinary = await cloudinary.uploader.upload(postImage, {
      folder: 'posts', // Dossier dans Cloudinary pour organiser les images
      resource_type: 'image',
    });

    // Enregistrer l'URL de l'image dans la base de données
    const newPhoto = new Photo({
      url: resultCloudinary.secure_url,
      creationDate: new Date(),
    });

    await newPhoto.save();

    // Suppression du fichier temporaire
    fs.unlinkSync(postImage);

    // Réponse à l'utilisateur avec l'URL de l'image
    res.json({ result: true, url: resultCloudinary.secure_url });

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'image:', error);

    // En cas d'erreur, supprimez toujours le fichier temporaire
    if (fs.existsSync(postImage)) {
      fs.unlinkSync(postImage);
    }

    res.status(500).json({ result: false, error: 'Erreur interne du serveur.' });
  }
});

module.exports = router;