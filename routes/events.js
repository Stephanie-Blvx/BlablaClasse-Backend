var express = require('express');
var router = express.Router();
require('../models/connection');
const Event = require('../models/events');

// Route pour créer un event

router.post('/', (req, res) => {
   
  
  
              // Création d'un new Event
          const newEvent = new Event({
             
              description: req.body.description,
              date: req.body.date,
              classes: req.body.classe,
          });
  
          newEvent.save().then(newDoc => {
          res.json({ result: true, event: newDoc });
    })
  
  
  
  });


// route pour récupérer tous les events
router.get('/', (req, res) => {
    Event.find().populate('classes').then(data => {
      
        res.json({ result: true, events: data});
      
      })
    });
  

 


module.exports = router;