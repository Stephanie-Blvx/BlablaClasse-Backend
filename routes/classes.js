const express = require('express');
const router = express.Router();
const Class = require('../models/classes');

//------------------------- Route POST pour créer une nouvelle classe -------------------------
router.post('/', async (req, res) => {
  const { name, color, kids, teachers } = req.body; // Récupération des données de la classe

  try { // Bloc "try" pour gérer les erreurs potentielles lors de la création de la classe 
    const newClass = new Class({ // Création d'une nouvelle instance de la classe Class
      name, // Nom de la classe
      color, // Couleur de la classe
      kids: kids || [], // Initialisation d'un tableau vide si kids n'est pas fourni
      teachers: teachers || [] // Idem pour teachers
    });

    // Sauvegarde de la classe dans la base de données
    const savedClass = await newClass.save();

    // Envoi de la réponse avec la classe créée
    res.status(201).json(savedClass); // Statut 201 pour "Created" (créé) et envoi de la classe créée en JSON
  } catch (error) {
    console.error("Erreur lors de la création de la classe :", error);
    res.status(500).json({ message: "Erreur lors de la création de la classe" });
  }
});

//------------------------- Route GET pour récupérer toutes les classes ------------------------- 
router.get('/', (req, res) => { 
  Class.find({}).then(data => {
    if (data) { // Si des classes sont trouvées dans la base de données 
      res.json({ result: true, classes: data}); // Envoi des classes en JSON 
    } else {
      res.json({ result: false, error: 'No classes Found' });
    }
  });
});

module.exports = router;