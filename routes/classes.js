const express = require('express');
const router = express.Router();
const Class = require('../models/classes'); // Remplacez par le chemin correct vers votre modèle

// Route POST pour créer une nouvelle classe
router.post('/', async (req, res) => {
  const { name, color, kids, teachers } = req.body; // Récupération des données de la classe

  try {
    // Création de la nouvelle classe avec les données reçues
    const newClass = new Class({
      name,
      color,
      kids: kids || [], // Initialisation d'un tableau vide si kids n'est pas fourni
      teachers: teachers || [] // Idem pour teachers
    });

    // Sauvegarde de la classe dans la base de données
    const savedClass = await newClass.save();

    // Envoi de la réponse avec la classe créée
    res.status(201).json(savedClass);
  } catch (error) {
    console.error("Erreur lors de la création de la classe :", error);
    res.status(500).json({ message: "Erreur lors de la création de la classe" });
  }
});

router.get('/', (req, res) => {
  Class.find({}).then(data => {
    if (data) {
      res.json({ result: true, classes: data});
    } else {
      res.json({ result: false, error: 'No classes Found' });
    }
  });
});

module.exports = router;