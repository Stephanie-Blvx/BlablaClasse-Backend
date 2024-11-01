const bcrypt = require('bcrypt');
const Parent = require("../models/parents");


const validateCurrentPassword = async (req, res, next) => { // Middleware pour valider le mot de passe actuel
  const { parentId, currentPassword } = req.body; // Récupérer le parent et le mot de passe actuel

  console.log('parentId:', parentId); 
  try {
    const parent = await Parent.findById(parentId); // Trouver le parent par son ID
    if (!parent) { // Si parent non trouvé
      return res.status(404).json({ result: false, error: 'Parent non trouvé' }); // Si parent non trouvé
    }

    const isMatch = await bcrypt.compare(currentPassword, parent.password); // Comparer le mot de passe actuel
    console.log(isMatch); // Log de la comparaison
    if (!isMatch) { // Si mot de passe actuel incorrect
      return res.status(401).json({ result: false, error: 'Mot de passe actuel incorrect' }); // Message d'erreur
    }

    req.parent = parent; // Stocker le parent dans `req`

    console.log("Parent trouvé :", parent); // Dans `validateCurrentPassword`
    console.log("Mot de passe actuel correct :", isMatch); // Dans `validateCurrentPassword`
    console.log("Mise à jour du mot de passe réussie pour :", req.parent); // Dans `validateCurrentPassword`

    next(); // Passer au middleware suivant
  } catch (error) {
    res.status(500).json({ result: false, error: 'Erreur lors de la validation du mot de passe' });
  }
};

module.exports = validateCurrentPassword;