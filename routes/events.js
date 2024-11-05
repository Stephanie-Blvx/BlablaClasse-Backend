var express = require('express');
var router = express.Router();
require('../models/connection');
const Event = require('../models/events');

// Route pour créer un event

router.post('/', (req, res) => {



  // Création d'un new Event
  const newEvent = new Event({
    classe: req.body.classe,
    date: req.body.date,
    description: req.body.description,


  });

  newEvent.save().then(newDoc => {
    res.json({ result: true, event: newDoc });
  })



});


// route pour récupérer tous les events
router.get('/', (req, res) => {
  Event.find().populate('classe').then(events => {

    res.json({ result: true, events });

  })
});

// route pour delete un event 

router.delete('/:id', (req, res) => {
  const eventId = req.params.id;

  Event.findByIdAndDelete(eventId)
      .then(data => {
          if (data) {
              res.json({ result: true, message: 'Event deleted', event: data });
          } else {
              res.status(404).json({ result: false, error: 'Event not found' });
          }
      })
});



module.exports = router;