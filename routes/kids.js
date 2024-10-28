const express = require('express');
const router = express.Router();
const Kid = require('../models/kids');
const Parent = require('../models/parents');
const { checkBody } = require('../modules/checkBody');

// Route pour récupérer tous les enfants
router.get('/', (req, res) => {
  Kid.find()
    .then(kids => {
      res.json({ result: true, kids });
    })
});

// Route pour récupérer un enfant par son ID avec les informations du parent associé
router.get('/:id', (req, res) => {
    Kid.findById(req.params.id)
      .then(kid => {
        if (kid) {
          res.json({ result: true, kid });
        } else {
          res.status(404).json({ result: false, error: 'Kid not found' });
        }
      })
  });

// Route pour inscrire un enfant
router.post('/signup', (req, res) => {
  // Vérifie si les champs requis sont présents dans la requête
  if (!checkBody(req.body, ['firstname', 'lastname'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }


            // Création d'un nouvel objet Kid
        const newKid = new Kid({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            birthdate: req.body.birthdate,
            allergies: req.body.allergies,
            habits: req.body.habits,
            additionalInfo: req.body.additionalInfo,
            classes: req.body.classesId,
            parents: parent._id
        });

        // Sauvegarde du nouvel enfant dans la base de données
        newKid.save().then(newDoc => {
        res.json({ result: true, kid: newDoc });
  })



});

// Route pour mettre à jour un enfant par son id
router.put('/update/:id', (req, res) => {
  // Vérifie si les champs requis sont présents dans la requête
  if (!checkBody(req.body, ['firstname', 'lastname', 'birthdate'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Recherche et mise à jour de l'enfant par son id
  Kid.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(updatedKid => {
      if (updatedKid) {
        res.json({ result: true, kid: updatedKid });
      } else {
        res.json({ result: false, error: 'Kid not found' });
      }
    })
});

// Route pour supprimer un enfant par son id
router.delete('/delete/:id', (req, res) => {
  // Recherche et suppression de l'enfant par son id
  Kid.findByIdAndDelete(req.params.id)
    .then(deletedKid => {
      if (deletedKid) {
        res.json({ result: true, message: 'Kid deleted successfully' });
      } else {
        res.json({ result: false, error: 'Kid not found' });
      }
    })
});

module.exports = router;