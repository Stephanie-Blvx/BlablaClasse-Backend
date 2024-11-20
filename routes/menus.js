var express = require('express');
var router = express.Router();
const Menu = require('../models/menus')

const cloudinary = require('cloudinary').v2;
const uniqid = require('uniqid');
const fs = require('fs');

//------------------------- Route pour upload menu (tunnel enseignant admin) -------------------------
router.post('/', async (req, res) => {

  const menu = `/tmp/${uniqid()}.jpg` // Création d'un nom de fichier unique pour le menu à partir de la librairie uniqid  
  const resultMove = await req.files.menuFromFront.mv(menu); // Mise à jour du menu sur le serveur avec le fichier envoyé depuis le front 

  if (!resultMove) { // Si le fichier a été correctement déplacé sur le serveur
    const resultCloudinary = await cloudinary.uploader.upload(menu); // Upload du menu sur Cloudinary 

  const newMenu = new Menu({ // Création d'une nouvelle instance de la classe Menu
    url:resultCloudinary.secure_url, // URL du menu sur Cloudinary 
    creationDate: new Date(), // Date de création du menu
  });

  newMenu.save() // Sauvegarde du menu dans la base de données
    .then(savedMenu => { // Résultat de la sauvegarde
      res.json({ result: true, url: resultCloudinary.secure_url }); // Envoi de la réponse avec l'URL du menu
    })
  } else {
    res.json({ result: false, error: resultMove }); // Envoi d'une erreur si le fichier n'a pas été correctement déplacé
  }

  fs.unlinkSync(menu); // Suppression du fichier temporaire sur le serveur après l'upload sur Cloudinary 
});

//------------------------- Route pour download menu (tunnel parent) -------------------------
router.get('/', (req, res) => {
  Menu.findOne()  // Recherche du dernier menu dans la base de données
    .sort({ creationDate: -1 }) // Tri par date de création décroissante pour récupérer le dernier menu enregistré en premier
    .then(data => {
      if (data) {
        res.json({ result: true, menu: data }); // Envoi du menu en JSON si trouvé dans la base de données 
      } else {
        res.json({ result: false, error: 'No menu found' });
      }
    })
    .catch(error => {
      res.json({ result: false, error: error.message });
    });
});

module.exports = router;