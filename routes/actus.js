var express = require('express');
var router = express.Router();
require('../models/connection');
const Actu = require('../models/actus');


// Route GET récupère les actus
router.get('/', (req, res) => {
    Actu.find({}).then(data => {
      if (data) {
        res.json({ result: true, actus: data});
      } else {
        res.json({ result: false, error: 'No actus Found' });
      }
    });
  });



// Route POST >> Nouvelle actu
router.post('/', (req, res) => {
  const newActu = new Actu({
 content : req.body.content
  });

 
  newActu.save().then((newDoc) => {
    res.json({ result: true, actu: newDoc }); 
  });
  
});












module.exports = router;