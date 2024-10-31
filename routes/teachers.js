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

//Route pour récupérer tous les enseignants
router.get('/:id', (req, res) => {
  Teacher.find({}).then(data => {
    if (data) {
      res.json({ result: true, posts: data});
    } else {
      res.json({ result: false, error: 'No teacher Found' });
    }
  });
});

// Route pour inscrire un enseignant
router.post('/signup', (req, res) => {
  // Vérifie si les champs requis sont présents dans la requête
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Vérifie si l'enseignant existe déjà dans la base de données
  Teacher.findOne({ email: req.body.email }).then(data => {
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


router.post('/signin', (req, res) => {
  // Vérifie si les champs requis sont présents dans la requête
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Recherche du parent dans la base de données
  Teacher.findOne({ email: req.body.email }).then(data => {
    // Vérifie si le parent existe et si le mot de passe est correct
    if (data && bcrypt.compareSync(req.body.password, data.password, )) {
      res.json({ result: true, token: data.token, email: data.email, lastname: data.lastname, firstname: data.firstname, username: data.username, classes: data.classes, id: data.id });
    } else {
      res.json({ result: false, error: 'Teacher not found or wrong password' });
    }
  });
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
    if (!checkBody(req.body, ['email', 'password'])) {
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