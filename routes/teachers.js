const express = require('express');
const router = express.Router();
const Teacher = require('../models/teachers');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

// Route pour récupérer tous les enseignants
router.get('/', (req, res) => {
  Teacher.find()
    .then(teachers => {
      res.json({ result: true, teachers });
    })
});

// Route pour inscrire un enseignant
router.post('/signup', (req, res) => {
  // Vérifie si les champs requis sont présents dans la requête
  if (!checkBody(req.body, ['firstname', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Vérifie si l'enseignant existe déjà dans la base de données
  Teacher.findOne({ firstname: req.body.firstname }).then(data => {
    if (data === null) {
      // Hachage du mot de passe
      const hash = bcrypt.hashSync(req.body.password, 10);

      // Création d'un nouvel objet Teacher
      const newTeacher = new Teacher({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        email: req.body.email,
        password: hash,
        token: uid2(32),
        isAdmin: req.body.isAdmin || false,
        classes: []
      });

      // Sauvegarde du nouvel enseignant dans la base de données
      newTeacher.save().then(newDoc => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // Si l'enseignant existe déjà dans la bdd
      res.json({ result: false, error: 'Teacher already exists' });
    }
  })
});

// Route pour supprimer un teacher par son id
router.delete('/:id', (req, res) => {
    // Recherche et suppression du teacher par son id
    Teacher.findByIdAndDelete(req.params.id)
      .then(deletedTeacher => {
        if (deletedTeacher) {
          res.json({ result: true, message: 'Teacher deleted successfully' });
        } else {
          res.json({ result: false, error: 'Teacher not found' });
        }
      })
  });
  
  
  // Route pour mettre à jour un teacher par son id
  router.put('/:id', (req, res) => {
    // Vérifie si les champs requis sont présents dans la requête
    if (!checkBody(req.body, ['firstname', 'lastname', 'email'])) {
      return res.json({ result: false, error: 'Missing or empty fields' });
    }
  
    // Recherche et mise à jour du teacher par son id
    Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(updatedTeacher => {
        if (updatedTeacher) {
          res.json({ result: true, teacher: updatedTeacher });
        } else {
          res.json({ result: false, error: 'Teacher not found' });
        }
      })
  });
module.exports = router;