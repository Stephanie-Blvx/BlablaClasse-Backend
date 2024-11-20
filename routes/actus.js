var express = require('express');
var router = express.Router();
require('../models/connection');
const Actu = require('../models/actus');


//------------------------- Route GET récupère la dernière actu -------------------------
router.get('/', (req, res) => {
  Actu.findOne() 
    .sort({ creationDate: -1 })  // Tri par date de création décroissante pour récupérer la dernière actu enregistrée en premier 
    .then(data => {
      if (data) {
        res.json({ result: true, actu: data }); // Envoi de la actu en JSON  si elle existe 
      } else {
        res.json({ result: false, error: 'No actus found' });
      }
    })
    .catch(error => {
      res.json({ result: false, error: error.message });
    });
});



//------------------------- Route POST >> Nouvelle actu -------------------------
router.post('/', (req, res) => {
  const newActu = new Actu({
 content : req.body.content,
 creationDate: new Date(),
  });

 
  newActu.save().then((newDoc) => {
    res.json({ result: true, actu: newDoc }); 
  });
  
});












module.exports = router;