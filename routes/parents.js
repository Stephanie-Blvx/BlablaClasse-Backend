var express = require('express');
var router = express.Router();
const Parent = require('../models/parents');
 const Kid = require('../models/kids');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 

// Route pour récupérer tous les parents
router.get('/', (req, res) => {
  Parent.find()
  .populate('kids') // Utilise populate pour récupérer les informations des enfants associés
    .then(parents => {
      res.json({ result: true, parents });
    })
});

// Route pour récupérer un parent par son ID avec ses enfants associés
router.get('/:id', (req, res) => {
  Parent.findById(req.params.id)
    .populate('kids') // Utilisation de 'populate' pour récupérer les infos des enfants
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
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Vérifie si le parent existe déjà dans la base de données
  Parent.findOne({ email: req.body.email }).then(data => {
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
        kids: [] // Initialisation sans enfant
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
//--------------------------Route pour la connexion d'un parent-------------------------------

router.post('/signin', (req, res) => {
  // Vérifie si les champs requis sont présents dans la requête
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Recherche du parent dans la base de données
  Parent.findOne({ email: req.body.email })
  .populate('kids')
  .then(data => {
    console.log("data retournée par la database:", data);
    // Vérifie si le parent existe et si le mot de passe est correct
    if (data && bcrypt.compareSync(req.body.password, data.password, )) {
      res.json({ result: true, token: data.token, email: data.email, lastname: data.lastname, firstname: data.firstname, kids: data.kids}); // la route retourne email, token, enfants du parent
    } else {
      res.json({ result: false, error: 'Parent not found or wrong password' });
    }
  });
});

//-------------------------Route pour associer un enfant existant à un parent------------

router.put('/add-child/:parentId/:childId', (req, res) => {
  Parent.findById(req.params.parentId)
    .then(parent => {
      if (!parent) {
        res.status(404).json({ result: false, error: 'Parent not found' });
        return;
      }
      if (!parent.kids.includes(req.params.childId)) {
        parent.kids.push(req.params.childId);
      }
      return parent.save();
    })
    .then(updatedParent => {
      res.json({ result: true, parent: updatedParent });
    })
});

//----------------------Route pour mettre à jour un parent par son id------------------------
router.put('/:id', (req, res) => {
  // Vérifie si les champs requis sont présents dans la requête
  if (!checkBody(req.body, ['email', 'password'])) {
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
//----------------------Route pour mettre à jour un parent par son id----------------

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



//---------------------- Route pour changer le mot de passe d'un parent --------------------- 
router.put('/parents/change-password', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Récupère le token

    if (!token) return res.status(401).json({ error: "Token is missing" });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" }); // Forbidden

        const parentId = user.id; // Récupérez l'ID du parent à partir du token décodé
        const { currentPassword, newPassword } = req.body;

        // Logique pour changer le mot de passe ici, par exemple :
        Parent.findById(parentId, (err, parent) => {
            if (err || !parent) {
                return res.status(404).json({ error: "Parent not found" });
            }

            // Vérifiez le mot de passe actuel et changez-le
            if (parent.password !== currentPassword) {
                return res.status(401).json({ error: "Current password is incorrect" });
            }

            parent.password = newPassword;
            parent.save(err => {
                if (err) return res.status(500).json({ error: "Error saving new password" });
                return res.json({ result: true, message: "Password changed successfully" });
            });
        });
    });
});

//---------------------- Route pour changer l'email d'un parent --------------------- 
router.put('/parents/change-email', (req, res) => {
  const { token, newEmail } = req.body; // Extraire le token et le nouvel email du corps de la requête

  // Vérifier si le token et le nouvel email sont présents
  if (!token || !newEmail) {
    return res.status(400).json({ result: false, error: 'Token ou nouvel email manquant' });
  }

  // Décoder le token pour obtenir l'ID du parent
  const decoded = someTokenDecodingFunction(token); // Remplacez par la fonction appropriée
  if (!decoded || !decoded.id) {
    return res.status(401).json({ result: false, error: 'Token invalide' });
  }

  const parentId = decoded.id; // ID du parent extrait du token

  // Vérifier si l'email est valide
  if (!validateEmail(newEmail)) {
    return res.status(400).json({ result: false, error: 'Email invalide' });
  }

  // Mettre à jour l'email dans la base de données
  Parent.findByIdAndUpdate(parentId, { email: newEmail })
    .then(() => {
      res.status(200).json({ result: true, message: 'Email mis à jour avec succès' });
    })
});

// Fonction pour valider l'email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expression régulière pour valider l'email
  return re.test(email);
}

module.exports = router;
