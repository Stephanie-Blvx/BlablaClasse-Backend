var express = require('express');
var router = express.Router();
const cloudinary = require('cloudinary').v2;
const uniqid = require('uniqid');
const fs = require('fs');
const Post = require('../models/posts')


//------------------------- Route pour récupérer tous les messages -------------------------
router.get('/', (req, res) => {
    Post.find({}).then(data => { // Récupération de tous les posts dans la base de données 
      if (data) {
        res.json({ result: true, posts: data});
      } else {
        res.json({ result: false, error: 'No posts Found' });
      }
    });
  });

//------------------------- Route pour récupérer un post par son id -------------------------
  router.get('/:id', (req, res) => { 
    Post.find({}).then(data => {
      if (data) {
        res.json({ result: true, posts: data});
      } else {
        res.json({ result: false, error: 'No posts Found' });
      }
    });
  });

//------------------------- Route route pour mettre à jour l'état de isRead (checkBox) -------------------------
router.put('/:id', (req, res) => {
  const postId = req.params.id; // Récupérer l'id du post à mettre à jour 
  const { isRead, content } = req.body; // Récupérer les données de la requête

  // Préparer l'objet de mise à jour avec uniquement les champs fournis
  const updateFields = {}; // Initialisation de l'objet de mise à jour avec uniquement les champs fournis 
  if (isRead !== undefined) updateFields.isRead = isRead; // Si isRead est fourni, mettre à jour le champ isRead 
  if (content !== undefined) updateFields.content = content; // Si content est fourni, mettre à jour le champ content

  // Vérification qu'au moins un champ est fourni
  if (Object.keys(updateFields).length === 0) { // Si aucun champ n'est fourni 
      return res.status(400).json({ success: false, error: 'rien à mettre à jour.' }); // Renvoyer une erreur 400 
  }

  // Mise à jour du post en fonction des champs fournis
  Post.findByIdAndUpdate(
      postId, // Recherche du post par son id
      updateFields, // Mettre à jour les champs fournis
      { new: true } // Renvoyer le document mis à jour
  )
  .then(updatedPost => { // Résultat de la mise à jour
      if (updatedPost) { // Si le post est trouvé et mis à jour
          res.json({ success: true, post: updatedPost }); // Renvoyer le post mis à jour en JSON 
      } else {
          res.status(404).json({ success: false, error: 'Post not found' });
      }
  })
});

//------------------------- Route pour supprimer un post par son id -------------------------
router.delete('/:id', (req, res) => {
  const postId = req.params.id; // Récupérer l'id du post à supprimer

  Post.findById(postId) // Recherche du post par son id
      .then(deletedPost => {
          if (!deletedPost) { // Si le post n'est pas trouvé 
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
                      return Post.findByIdAndDelete(postId); // Suppression du post de la base de données
                  });
          } else {
              // Si pas d'image, supprimer directement le post
              return Post.findByIdAndDelete(postId); // Suppression du post de la base de données
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
  const photoPath = `/tmp/${uniqid()}.jpg`; // Création d'un nom de fichier unique pour l'image à partir de la librairie uniqid

  try { // Bloc "try" pour gérer les erreurs potentielles lors de l'ajout du post
      if (req.files && req.files.photoFromFront) { // Si une image a été fournie dans la requête 
          await req.files.photoFromFront.mv(photoPath); // Mise à jour de l'image sur le serveur avec le fichier envoyé depuis le front

        // Upload de l'image sur Cloudinary
        const resultCloudinary = await cloudinary.uploader.upload(photoPath, {
          folder: 'PostsImages'  // Création d'un dossier pour stocker les images
      });
        console.log('Image uploadée sur Cloudinary:', resultCloudinary.secure_url); // Affichage de l'URL de l'image sur Cloudinary
          // Création du post avec image
          const newPost = new Post({
              title: req.body.title,
              content: req.body.content,
              author: JSON.parse(req.body.author),
              images: [resultCloudinary.secure_url],
              cloudinaryId: resultCloudinary.public_id,
              creationDate: new Date(),
              isRead: false,
          });
          //sauvegarde du post
          await newPost.save();
          res.json({ success: true, post: newPost });
      } else {
         
        // Création du post sans image
          const newPost = new Post({
              title: req.body.title,
              content: req.body.content,
              author: JSON.parse(req.body.author),
              creationDate: new Date(),
              isRead: false,
          });
          await newPost.save();
          res.json({ success: true, post: newPost });
      }
  } catch (error) {
      console.error('Erreur lors de l\'ajout du post:', error);
      return res.status(500).json({ success: false, error: error.message });
  } finally {
      // Vérifiez si le fichier temporaire existe avant de le supprimer
      if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
      } else {
          console.warn('Le fichier temporaire n\'existe pas:', photoPath); //Ajout de condifitions pour débogage
      }
    }
  });
    

module.exports = router;