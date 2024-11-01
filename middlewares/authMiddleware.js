const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => { // Middleware pour vérifier le token

  const token = req.header('Authorization')?.replace('Bearer ', ''); // Récupérer le token
  if (!token) { // Si pas de token
    return res.status(401).json({ result: false, error: 'Accès refusé' }); // Message d'erreur
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Décoder le token
    console.log("Token décodé :", decoded); // Log du token décodé
    req.parent = decoded; // Stocker le parent dans `req`
    console.log("Parent trouvé :", req.parent); // Dans `authMiddleware
    next(); // Passer au middleware suivant
  } catch (error) { // Si erreur
    res.status(400).json({ result: false, error: 'Token invalide' }); // Message d'erreur
  }
};

module.exports = authMiddleware;