var express = require("express");
var router = express.Router();
const Parent = require("../models/parents");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const authMiddleware = require("../middlewares/authMiddleware");
const validateCurrentPassword = require("../middlewares/validateCurrentPassword");
const jwt = require("jsonwebtoken");

//-------------------------  Route pour récupérer tous les parents -------------------------
router.get("/", (req, res) => {
  Parent.find()
    .populate("kids") // Utilise populate pour récupérer les informations des enfants associés
    .then((parents) => {
      res.json({ result: true, parents });
    });
});

//-------------------------  Route pour récupérer un parent par son ID avec ses enfants associés --------------
router.get("/:id", (req, res) => {
  Parent.findById(req.params.id)
    .populate("kids") // Utilisation de 'populate' pour récupérer les infos des enfants
    .then((parent) => {
      if (parent) {
        res.json({ result: true, parent });
      } else {
        res.status(404).json({ result: false, error: "Parent not found" });
      }
    });
});

//-------------------------  Route pour inscrire un parent -------------------------
router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // Vérifie si le parent existe déjà dans la base de données
  Parent.findOne({ email: req.body.email }).then((data) => {
    if (data === null) {
      // Hachage du mot de passe
      const hash = bcrypt.hashSync(req.body.password, 10);

      // Création d'un nouvel objet Parent
      const newParent = new Parent({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: hash,
        username: req.body.username,
        token: uid2(32),
        kids: [], // Initialisation sans enfant
        userType: "parent", // Ajouter userType comme 'parent'
      });

      // Sauvegarde du nouveau parent dans la base de données
      newParent.save().then((newDoc) => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // Si le parent existe déjà dans la bdd
      res.json({ result: false, error: "Parent already exists" });
    }
  });
});

//--------------------------Route pour la connexion d'un parent-------------------------------
router.post("/signin", (req, res) => {
  // Vérifie si les champs requis sont présents dans la requête
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // Recherche du parent dans la base de données
  Parent.findOne({ email: req.body.email }) // Recherche du parent par son email
    .populate("kids") // Utilisation de 'populate' pour récupérer les informations des enfants associés
    .then((data) => {
      // data est le parent trouvé
      console.log("data retournée par la database:", data);
      // Vérifie si le parent existe et si le mot de passe est correct
      if (data && bcrypt.compareSync(req.body.password, data.password)) {
        const accessToken = jwt.sign(
          { id: data._id, email: data.email },
          process.env.JWT_SECRET,
          { expiresIn: "24h" }
        );
        res.json({
          result: true,
          accessToken,
          token: data.token,
          email: data.email,
          lastname: data.lastname,
          firstname: data.firstname,
          id: data.id,
          kids: data.kids,
          username: data.username,
          userType: data.userType, // Inclure le type d'utilisateur dans la réponse
        });
      } else {
        // Si le parent n'est pas trouvé ou si le mot de passe est incorrect
        res.json({
          result: false,
          error: "Parent not found or wrong password",
        });
      }
    });
});
//--------------------------Route pour la connexion d'un parent par token (QR Reader)-------------------------------

router.post("/signintoken", (req, res) => {
  //récupère un objet JSON = req.body = chaîne de caractères du QR code
  console.log("req.body", req.body);
  Parent.findOne({ token: req.body.token })
    .populate("kids") //peuple le champ kids
    .then((dbData) => {
      console.log("data retournée par la database:----------->", dbData); // console.log la réponse de la database
      if (dbData) {
        res.json({
          result: true,
          token: dbData.token,
          email: dbData.email,
          lastname: dbData.lastname,
          firstname: dbData.firstname,
          password: dbData.password,
          kids: dbData.kids,
          userType: dbData.userType,
          username: dbData.username,
        }); // la route retourne toutes les infos du parent
      } else {
        res.json({
          result: false,
          error: "Parent not found or wrong information",
        });
      }
    });
});

//-------------------------Route pour associer un enfant existant à un parent------------
router.put("/add-child/:parentId/:kidId", (req, res) => {
  Parent.findById(req.params.parentId) // Recherche du parent par son ID
    .then((parent) => {
      // parent est le parent trouvé
      if (!parent) {
        // Si le parent n'est pas trouvé
        res.status(404).json({ result: false, error: "Parent not found" });
        return;
      }
      if (!parent.kids.includes(req.params.kidId)) {
        // Si l'enfant n'est pas déjà associé au parent
        parent.kids.push(req.params.kidId); // Ajoutez l'ID de l'enfant à la liste des enfants du parent
      }
      return parent.save(); // Sauvegarde les modifications
    })
    .then((updatedParent) => {
      // updatedParent est le parent mis à jour
      res.json({ result: true, parent: updatedParent }); // Retourne le parent mis à jour
    });
});

//-------------------------  Route pour supprimer un parent par son id -------------------------
router.delete("/:id", (req, res) => {
  // Recherche et suppression du parent par son id
  Parent.findByIdAndDelete(req.params.id) // Recherche et suppression du parent par son id
    .then((deletedParent) => {
      // deletedParent est le parent supprimé
      if (deletedParent) {
        // Si le parent est trouvé et supprimé
        res.json({ result: true, message: "Parent deleted successfully" });
      } else {
        // Si le parent n'est pas trouvé
        res.json({ result: false, error: "Parent not found" });
      }
    });
});

//---------------------- Route pour changer le password ---------------------
router.put(
  "/change-password",
  authMiddleware,
  validateCurrentPassword,
  async (req, res) => {
    const { newPassword } = req.body;

    console.log("Nouveau mot de passe: " + newPassword);

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 5);
      req.parent.password = hashedPassword;
      await req.parent.save();
      res
        .status(200)
        .json({ result: true, message: "Mot de passe mis à jour avec succès" });
    } catch (error) {
      res
        .status(500)
        .json({
          result: false,
          error: "Erreur lors de la mise à jour du mot de passe",
        });
    }
  }
);
//---------------------- Route pour changer l'email d'un parent ---------------------
router.put("/change-email", (req, res) => {
  const { parentId, newEmail } = req.body; // Récupère l'ID du parent et le nouvel email
  console.log("Données reçues:", req.body);
  const authToken = req.headers["authorization"]?.split(" ")[1]; // Récupère le token

  console.log("Token reçu:", authToken); // Log du token reçu
  // Vérifiez que l'ID et l'email sont présents
  if (!parentId || !newEmail) {
    return res
      .status(400)
      .json({ result: false, error: "Informations manquantes" });
  }

  // Trouver le parent par son ID
  Parent.findById(parentId) // Recherche du parent par son ID
    .then((parent) => {
      // parent est le parent trouvé
      if (!parent) {
        // Si le parent n'est pas trouvé
        return res
          .status(404)
          .json({ result: false, error: "Parent non trouvé" });
      }

      // Vérifiez si le token est correct
      if (parent.token !== authToken) {
        // Si le token ne correspond pas à celui du parent
        return res.status(401).json({ result: false, error: "Token invalide" });
      }

      parent.email = newEmail; // Mettre à jour l'email du parent
      return parent.save(); // Sauvegarde les modifications
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
