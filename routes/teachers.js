const express = require("express");
const router = express.Router();
const Teacher = require("../models/teachers");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

//---------------------- Route pour récupérer tous les enseignants ---------------------
router.get("/", (req, res) => {
  Teacher.find().then((teachers) => {
    res.json({ result: true, teachers });
  });
});

//---------------------- Route pour récupérer tous les enseignants ---------------------
router.get("/:id", (req, res) => {
  Teacher.find({}).then((data) => {
    if (data) {
      res.json({ result: true, posts: data });
    } else {
      res.json({ result: false, error: "No teacher Found" });
    }
  });
});

//---------------------- Route pour inscrire un enseignant ---------------------
router.post("/signup", (req, res) => {
  // Vérifie si les champs requis sont présents dans la requête
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // Vérifie si l'enseignant existe déjà dans la base de données
  Teacher.findOne({ email: req.body.email }).then((data) => {
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
        userType: "teacher",
        isAdmin: req.body.isAdmin || false,
        classes: [],
      });

      // Sauvegarde du nouvel enseignant dans la base de données
      newTeacher.save().then((newDoc) => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // Si l'enseignant existe déjà dans la bdd
      res.json({ result: false, error: "Teacher already exists" });
    }
  });
});

//---------------------- Route pour connecter un enseignant ---------------------
router.post("/signin", (req, res) => {
  // Vérifie si les champs requis sont présents dans la requête
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // Recherche du teacher dans la base de données
  Teacher.findOne({ email: req.body.email }).then((data) => {
    // Vérifie si le teacher existe et si le mot de passe est correct
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({
        result: true,
        token: data.token,
        email: data.email,
        lastname: data.lastname,
        firstname: data.firstname,
        username: data.username,
        classes: data.classes,
        id: data.id,
        userType: data.userType,
        isAdmin: data.isAdmin
      });
    } else {
      res.json({ result: false, error: "Teacher not found or wrong password" });
    }
  });
});
//---------------------- Route pour connecter un enseignant avec son token (QR Code reader)---------------------
router.post("/signintoken", (req, res) => {
  
  Teacher.findOne({ token: req.body.token }) // Vérifie si le token existe dans la Collection Teachers
    // .populate('classes') //peuple le champ classes
    .then((data) => {
    if (data) {
      res.json({
        result: true,
        token: data.token,
        email: data.email,
        lastname: data.lastname,
        firstname: data.firstname,
        username: data.username,
        classes: data.classes,
        id: data.id,
        userType: data.userType,
      });
    } else {
      res.json({ result: false, error: "Teacher not found with scanned token" });
    }
  });
});


//---------------------- Route pour supprimer un teacher par son id ---------------------
router.delete("/:id", (req, res) => { 
  // Recherche et suppression du teacher par son id
  Teacher.findByIdAndDelete(req.params.id).then((deletedTeacher) => {
    if (deletedTeacher) {
      res.json({ result: true, message: "Teacher deleted successfully" });
    } else {
      res.json({ result: false, error: "Teacher not found" });
    }
  });
});

//---------------------- Route pour mettre à jour un teacher par son id ---------------------
// router.put("/:id", (req, res) => {
//   // Vérifie si les champs requis sont présents dans la requête
//   if (!checkBody(req.body, ["email", "password"])) {
//     return res.json({ result: false, error: "Missing or empty fields" });
//   }

//   // Recherche et mise à jour du teacher par son id
//   Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true }).then(
//     (updatedTeacher) => {
//       if (updatedTeacher) {
//         res.json({ result: true, teacher: updatedTeacher });
//       } else {
//         res.json({ result: false, error: "Teacher not found" });
//       }
//     }
//   );
// });


//---------------------- Route pour changer le mot de passe d'un teacher ---------------------
router.put("/change-password", (req, res) => {
  const { teacherId, currentPassword, newPassword } = req.body; // Récupère l'ID du teacher, le mot de passe actuel et le nouveau mot de passe
  console.log(teacherId, currentPassword, newPassword);
  const authToken = req.headers["authorization"]?.split(" ")[1]; // Récupère le token

  // Vérifiez que l'ID, le mot de passe actuel et le nouveau mot de passe sont présents
  if (!teacherId || !currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ result: false, error: "Informations manquantes" });
  }

  // Trouver le teacher par son ID
  Teacher.findById(teacherId) // Recherche du teacher par son ID
    .then((teacher) => {
      // teacher est le teacher trouvé
      if (!teacher) {
        // Si le teacher n'est pas trouvé
        return res
          .status(404)
          .json({ result: false, error: "teacher non trouvé" });
      }

      // Vérifiez si le token est correct
      if (teacher.token !== authToken) {
        // Si le token ne correspond pas à celui du teacher
        return res.status(401).json({ result: false, error: "Token invalide" });
      }

      // Vérifiez le mot de passe actuel
      if (!bcrypt.compareSync(currentPassword, teacher.password)) {
        return res
          .status(401)
          .json({ result: false, error: "Mot de passe actuel incorrect" });
      }

      // Hachage du nouveau mot de passe
      teacher.password = bcrypt.hashSync(newPassword, 10); // Hache le nouveau mot de passe
      return teacher.save(); // Sauvegarde les modifications
    })
    .then(() =>
      res
        .status(200)
        .json({ result: true, message: "Mot de passe mis à jour avec succès" })
    )
    .catch(() =>
      res.status(500).json({
        result: false,
        error: "Erreur lors de la mise à jour du mot de passe",
      })
    );
});

//---------------------- Route pour changer l'email d'un teacher ---------------------
router.put("/change-email", (req, res) => {
  const { teacherId, newEmail } = req.body; // Récupère l'ID du teacher et le nouvel email
  console.log("Données reçues:", req.body);
  const authToken = req.headers["authorization"]?.split(" ")[1]; // Récupère le token

  console.log("Token reçu:", authToken); // Log du token reçu
  // Vérifiez que l'ID et l'email sont présents
  if (!teacherId || !newEmail) {
    return res
      .status(400)
      .json({ result: false, error: "Informations manquantes" });
  }

  // Trouver le teacher par son ID
  Teacher.findById(teacherId) // Recherche du teacher par son ID
    .then((teacher) => {
      // teacher est le teacher trouvé
      if (!teacher) {
        // Si le teacher n'est pas trouvé
        return res
          .status(404)
          .json({ result: false, error: "teacher non trouvé" });
      }

      // Vérifiez si le token est correct
      if (teacher.token !== authToken) {
        // Si le token ne correspond pas à celui du teacher
        return res.status(401).json({ result: false, error: "Token invalide" });
      }

      teacher.email = newEmail; // Mettre à jour l'email du teacher
      return teacher.save(); // Sauvegarde les modifications
    })
    .then(() =>
      res
        .status(200)
        .json({ result: true, message: "Email mis à jour avec succès" })
    )
    .catch(() =>
      res.status(500).json({
        result: false,
        error: "Erreur lors de la mise à jour de l'email",
      })
    );
});
module.exports = router;
