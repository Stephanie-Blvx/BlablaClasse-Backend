var express = require('express');
var router = express.Router();
require('../models/connection');
const Event = require('../models/events');

//------------------------- Route pour créer un event -------------------------
router.post('/', (req, res) => {
  const newEvent = new Event({ // Création d'une nouvelle instance de la classe Event 
    classe: req.body.classe,
    date: req.body.date,
    description: req.body.description,
  });

  newEvent.save().then(newDoc => { // Sauvegarde de l'event dans la base de données 
    res.json({ result: true, event: newDoc });
  })
});


//------------------------- Route pour récupérer tous les events -------------------------
router.get('/', (req, res) => {
  Event.find().populate('classe').then(events => { // Récupération de tous les events dans la base de données 
    res.json({ result: true, events }); // Envoi des events en JSON 

  })
});

//------------------------- Route pour supprimer un event par son id -------------------------
router.delete('/:id', (req, res) => { 
  const eventId = req.params.id; // Récupération de l'id de l'event à supprimer 
  Event.findByIdAndDelete(eventId) // Recherche de l'event par son id et suppression de l'event de la base de données
      .then(data => {
          if (data) {
              res.json({ result: true, message: 'Event deleted', event: data });
          } else {
              res.status(404).json({ result: false, error: 'Event not found' });
          }
      })
});

module.exports = router;