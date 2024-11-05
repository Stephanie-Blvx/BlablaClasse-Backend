var express = require('express');
var router = express.Router();
const Messages = require("../models/messages");
const Parent = require("../models/parents");
const Teacher = require("../models/teachers");
const Pusher = require('pusher');

//-------------------------  Configurer Pusher --------------------------------
const pusher = new Pusher({
  appId: process.env.PUSHER_APPID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

// -------------------------  Récupérer les messages -------------------------
router.get('/messages', async (req, res) => {
  try {
    const messages = await Messages.find().sort({ createdAt: 1 }); // Trier par date de création, du plus ancien au plus récent
    res.json(messages); // Renvoyer les messages sous forme de JSON
  } catch (error) {
    console.error('Erreur lors de la récupération des messages :', error);
    res.status(500).json({ result: false, error: 'Erreur serveur lors de la récupération des messages' });
  }
});


//-------------------------   Joindre le chat  -------------------------
router.put('/users/:username', async (req, res) => {
  const { username } = req.params; // Nom d'utilisateur
  const { userType } = req.body; // parent ou teacher

  console.log('username:', username);

  try {
    // Vérifier dans la collection correspondante
    let userExists = false;
    if (userType === 'parent') { 
      userExists = await Parent.exists({ username }); 
    } else if (userType === 'teacher') { 
      userExists = await Teacher.exists({ username }); 
    }
 
    if (!userExists) { // Si l'utilisateur n'existe pas
      return res.status(404).json({ result: false, error: 'User not found' });
    }

    // Envoyer l'événement 'join' à Pusher
    pusher.trigger('chat', 'join', { username, userType }); 
    res.json({ result: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: 'Server error' });
  }
});

//-------------------------   Quitter le chat --------------------------------
router.delete('/users/:username', async (req, res) => {
  const { username } = req.params;
  const { userType } = req.body;

  pusher.trigger('chat', 'leave', { username, userType }); 
  res.json({ result: true }); 
});

//-------------------------   Envoyer un message --------------------------------
router.post('/messages', async (req, res) => {
  const { text, username, userType } = req.body;

  // Enregistrer le message dans la base de données (vous devez avoir un modèle pour cela)
  const newMessage = new Messages({ text, username, userType });
  await newMessage.save();

  // Envoyer l'événement de message à Pusher
  pusher.trigger('chat', 'message', {
    text, 
    username, 
    userType, 
    createdAt: new Date(), 
  });

  res.json({ result: true });
});


module.exports = router;
