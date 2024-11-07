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
    // Vérification des données nécessaires dans la requête
    const { title, content, author, classes } = req.body;
    if (!title || !content || !author || !author.id || !author.username || !author.firstname) {
      return res.status(400).json({ result: false, error: 'Le titre, le contenu et l\'auteur sont requis.' });
    }

    // Vérification si une image a été envoyée
    if (!req.files || !req.files.photoFromFront) {
      return res.status(400).json({ result: false, error: 'Aucune image envoyée.' });
    }

    // Si plusieurs images sont envoyées, les traiter une par une
    const imageUrls = [];
    for (const file of req.files.photoFromFront) {
      const postImage = `./tmp/${uniqid()}.jpg`; // Vous pouvez ajuster le format en fonction du type d'image

      // Déplacer l'image téléchargée vers un fichier temporaire
      const resultMove = await file.mv(postImage);
      if (resultMove) {
        return res.status(500).json({ result: false, error: 'Erreur lors du déplacement du fichier.' });
      }

      // Upload de l'image sur Cloudinary
      const resultCloudinary = await cloudinary.uploader.upload(postImage, {
        folder: 'PostsImages', // Dossier dans Cloudinary pour organiser les images
        resource_type: 'image', // Assurez-vous que le fichier est bien une image
      });

      // Ajouter l'URL de l'image dans le tableau des images
      imageUrls.push(resultCloudinary.secure_url);

      // Supprimer le fichier temporaire après le téléchargement
      fs.unlinkSync(postImage);
    }

    // Créer un nouvel objet de post avec l'image(s) et autres données
    const newPost = new Post({
      title,
      content,
      author, // L'auteur est directement passé, puisque c'est un objet avec id, username, firstname
      creationDate: new Date(),
      images: imageUrls, // Ajouter l'URL(s) de l'image(s)
      classes: classes || [], // Si aucune classe n'est passée, on laisse un tableau vide
      isRead: false, // Valeur par défaut
    });

    // Sauvegarder le post dans la base de données
    await newPost.save();

    // Réponse à l'utilisateur avec l'URL de l'image et les informations du post
    res.json({
      result: true,
      message: 'Post créé avec succès!',
      post: newPost,
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi du formulaire:', error);

    // En cas d'erreur, supprimez toujours le fichier temporaire
    if (fs.existsSync(postImage)) {
      fs.unlinkSync(postImage);
    }

    res.status(500).json({ result: false, error: 'Erreur interne du serveur.' });
  }
});

module.exports = router;