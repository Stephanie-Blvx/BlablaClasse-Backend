const express = require('express');
const router = express.Router();
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

// Route GET pour récupérer tous les messages
router.get('/messages', async (req, res) => {
  try {
    // Récupérer les messages triés par date de création (du plus ancien au plus récent)
    const messages = await Messages.find().sort({ createdAt: 1 });
    
    if (!messages || messages.length === 0) {
      return res.status(404).json({ result: false, error: 'Aucun message trouvé' });
    }

    res.json(messages); // Renvoyer les messages sous forme de JSON
  } catch (error) {
    console.error('Erreur lors de la récupération des messages :', error);
    res.status(500).json({ result: false, error: 'Erreur serveur lors de la récupération des messages' });
  }
});

//-------------------------   Joindre le chat  -------------------------
router.put('/users/:username', async (req, res) => {
  const { username } = req.params;
  const { userType } = req.body;

  try {
    let userExists = false;
    if (userType === 'parent') { 
      userExists = await Parent.exists({ username }); 
    } else if (userType === 'teacher') { 
      userExists = await Teacher.exists({ username }); 
    }
 
    if (!userExists) {
      return res.status(404).json({ result: false, error: 'User not found' });
    }

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

  try {
    pusher.trigger('chat', 'leave', { username, userType });
    res.json({ result: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: 'Error while leaving the chat' });
  }
});

//-------------------------   Envoyer un message --------------------------------
router.post('/messages', async (req, res) => {
  const { text, username, userType } = req.body;

  if (!text || !username || !userType) {
    return res.status(400).json({ result: false, error: 'Missing required fields' });
  }

  try {
    // Créer un nouveau message
    const newMessage = new Messages({ text, username, userType });
    await newMessage.save(); // Sauvegarder dans la base de données

    // Une fois sauvegardé, émettre un événement Pusher
    pusher.trigger('chat', 'message', {
      text, 
      username, 
      userType, 
      createdAt: new Date(), 
    });

    res.json({ result: true });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message :', error);
    res.status(500).json({ result: false, error: 'Erreur serveur lors de l\'envoi du message' });
  }
});


module.exports = router;
