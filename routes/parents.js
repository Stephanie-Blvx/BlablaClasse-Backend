var express = require('express');
var router = express.Router();
const Parent = require('../models/parents');
 const Kid = require('../models/kids');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

// Route pour récupérer tous les parents
router.get('/', (req, res) => {
  Parent.find()
  .populate('children') // Utilise populate pour récupérer les informations des enfants associés
    .then(parents => {
      res.json({ result: true, parents });
    })
});

// Route pour récupérer un parent par son ID avec ses enfants associés
router.get('/:id', (req, res) => {
  Parent.findById(req.params.id)
    .populate('children') // Utilisation de 'populate' pour récupérer les infos des enfants
    .then(parent => {
      if (parent) {
        res.json({ result: true, parent });
      } else {
        res.status(404).json({ result: false, error: 'Parent not found' });
      }
    })
});


// Route pour inscrire un parent
router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['firstname', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Vérifie si le parent existe déjà dans la base de données
  Parent.findOne({ firstname: req.body.firstname }).then(data => {
    if (data === null) {
      // Hachage du mot de passe
      const hash = bcrypt.hashSync(req.body.password, 10);

      // Création d'un nouvel objet Parent
      const newParent = new Parent({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: hash,
        token: uid2(32),
        children: [] // Initialisation sans enfant
      });

      // Sauvegarde du nouveau parent dans la base de données
      newParent.save().then(newDoc => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // Si le parent existe déjà dans la bdd
      res.json({ result: false, error: 'Parent already exists' });
    }
  });
});

// Route pour la connexion d'un parent
router.post('/signin', (req, res) => {
  // Vérifie si les champs requis sont présents dans la requête
  if (!checkBody(req.body, ['firstname', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Recherche du parent dans la base de données
  Parent.findOne({ firstname: req.body.firstname }).then(data => {
    // Vérifie si le parent existe et si le mot de passe est correct
    if (data && bcrypt.compareSync(req.body.password, data.password, )) {
      res.json({ result: true, token: data.token, firstname: data.firstname });
    } else {
      res.json({ result: false, error: 'Parent not found or wrong password' });
    }
  });
});



// Route pour associer un enfant existant à un parent
router.put('/add-child/:parentId/:childId', (req, res) => {
  Parent.findById(req.params.parentId)
    .then(parent => {
      if (!parent) {
        res.status(404).json({ result: false, error: 'Parent not found' });
        return;
      }
      if (!parent.children.includes(req.params.childId)) {
        parent.children.push(req.params.childId);
      }
      return parent.save();
    })
    .then(updatedParent => {
      res.json({ result: true, parent: updatedParent });
    })
});

// Route pour mettre à jour un parent par son id
router.put('/:id', (req, res) => {
  // Vérifie si les champs requis sont présents dans la requête
  if (!checkBody(req.body, ['firstname', 'lastname', 'email'])) {
    return res.json({ result: false, error: 'Missing or empty fields' });
  }

  // Recherche et mise à jour du parent par son id
  Parent.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(updatedParent => {
      if (updatedParent) {
        res.json({ result: true, parent: updatedParent });
      } else {
        res.json({ result: false, error: 'Parent not found' });
      }
    })
});

// Route pour supprimer un parent par son id
router.delete('/:id', (req, res) => {
  // Recherche et suppression du parent par son id
  Parent.findByIdAndDelete(req.params.id)
    .then(deletedParent => {
      if (deletedParent) {
        res.json({ result: true, message: 'Parent deleted successfully' });
      } else {
        res.json({ result: false, error: 'Parent not found' });
      }
    })
});


module.exports = router;
