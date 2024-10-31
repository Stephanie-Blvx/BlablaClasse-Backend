const express = require("express");
const router = express.Router();
const Kid = require("../models/kids");
const Parent = require("../models/parents");
const { checkBody } = require("../modules/checkBody");

//------------------------- Route pour récupérer tous les enfants -------------------------
router.get("/", (req, res) => {
  Kid.find().then((kids) => {
    // Recherche de tous les enfants
    res.json({ result: true, kids }); // Retourne les enfants trouvés
  });
});

//-------------------------  Route pour récupérer un enfant par son ID -------------------------
router.get("/:id", (req, res) => {
  // Route pour récupérer un enfant par son ID
  Kid.findById(req.params.id).then((kid) => {
    // Recherche de l'enfant par son ID
    if (kid) {
      // Si l'enfant est trouvé
      res.json({ result: true, kid }); // Retourne l'enfant trouvé
    } else {
      // Si l'enfant n'est pas trouvé
      res.status(404).json({ result: false, error: "Kid not found" });
    }
  });
});

//------------------------- Route pour inscrire un enfant -------------------------
router.post("/signup", (req, res) => {
  // Route pour inscrire un enfant
  // Vérifie si les champs requis sont présents dans la requête
  if (!checkBody(req.body, ["firstname", "lastname"])) {
    // Vérifie si les champs requis sont présents dans la requête
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // Création d'un nouvel objet Kid
  const newKid = new Kid({
    // Création d'un nouvel objet Kid
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    birthdate: req.body.birthdate,
    allergies: req.body.allergies,
    habits: req.body.habits,
    additionalInfo: req.body.additionalInfo,
    classes: req.body.classesId,
  });

  // Sauvegarde du nouvel enfant dans la base de données
  newKid.save().then((newDoc) => {
    res.json({ result: true, kid: newDoc }); // Retourne l'enfant créé
  });
});

//------------------------- Route pour mettre à jour un enfant par son id -------------------------
router.put("/update/:id", (req, res) => {
  // Vérifie si les champs requis sont présents dans la requête
  if (!checkBody(req.body, ["firstname", "lastname", "birthdate"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // Recherche et mise à jour de l'enfant par son id
  Kid.findByIdAndUpdate(req.params.id, req.body, { new: true }) // Utilisez l'option { new: true } pour retourner le document mis à jour au lieu de l'original par défaut (option mongoose)
    .then((updatedKid) => {
      // Retourne l'enfant mis à jour
      if (updatedKid) {
        // Si l'enfant est trouvé
        res.json({ result: true, kid: updatedKid }); // Retourne l'enfant mis à jour
      } else {
        // Si l'enfant n'est pas trouvé
        res.json({ result: false, error: "Kid not found" }); // Retourne un message d'erreur
      }
    });
});

//------------------------- Route pour associer un enfant à une classe -------------------------
router.put("/add-class/:kidId/:classId", (req, res) => {
  // Recherche de l'enfant par son ID
  Kid.findById(req.params.kidId)
    .then((kid) => {
      // Vérifie si l'enfant est trouvé
      if (!kid) {
        res.status(404).json({ result: false, error: "Kid not found" });
        return;
      }

      // Vérifie si la classe est déjà associée à l'enfant
      if (!kid.classes.includes(req.params.classId)) {
        // Ajoutez l'ID de la classe à la liste des classes de l'enfant
        kid.classes.push(req.params.classId);
      }

      // Sauvegarde les modifications
      return kid.save();
    })
    .then((updatedKid) => {
      // Retourne l'enfant mis à jour
      res.json({ result: true, kid: updatedKid });
    })
    .catch((error) => {
      // Gérer les erreurs
      res
        .status(500)
        .json({
          result: false,
          error: "An error occurred",
          details: error.message,
        });
    });
});

//------------------------- Route pour supprimer un enfant par son id -------------------------
router.delete("/delete/:id", (req, res) => {
  // Recherche et suppression de l'enfant par son id
  Kid.findByIdAndDelete(req.params.id).then((deletedKid) => {
    if (deletedKid) {
      // Si l'enfant est trouvé et supprimé avec succès
      res.json({ result: true, message: "Kid deleted successfully" });
    } else {
      // Si l'enfant n'est pas trouvé
      res.json({ result: false, error: "Kid not found" });
    }
  });
});

module.exports = router;
