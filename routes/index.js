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

//------------------------- Route GET pour récupérer tous les messages -------------------------
router.get('/messages', async (req, res) => {
  try { // Bloc "try" pour gérer les erreurs potentielles lors de la récupération des messages
    // Récupérer les messages triés par date de création (du plus ancien au plus récent)
    const messages = await Messages.find().sort({ createdAt: 1 });
    
    if (!messages || messages.length === 0) { // Si aucun message n'est trouvé dans la base de données 
      return res.status(404).json({ result: false, error: 'Aucun message trouvé' });
    }

    res.json(messages); // Renvoyer les messages sous forme de JSON
  } catch (error) { // Bloc "catch" pour gérer les erreurs potentielles lors de la récupération des messages 
    console.error('Erreur lors de la récupération des messages :', error);
    res.status(500).json({ result: false, error: 'Erreur serveur lors de la récupération des messages' });
  }
});

//-------------------------   Joindre le chat  -------------------------
router.put('/users/:username', async (req, res) => {
  const { username } = req.params; // Récupérer le nom d'utilisateur de la requête
  const { userType } = req.body; // Récupérer le type d'utilisateur de la requête

  try { // Bloc "try" pour gérer les erreurs potentielles lors de la vérification de l'utilisateur
    let userExists = false; // Initialisation de la variable userExists à false par défaut 
    if (userType === 'parent') {  // Si l'utilisateur est un parent 
      userExists = await Parent.exists({ username });  // Vérifier si le parent existe dans la base de données
    } else if (userType === 'teacher') {  // Si l'utilisateur est un enseignant
      userExists = await Teacher.exists({ username });  // Vérifier si l'enseignant existe dans la base de données
    }
 
    if (!userExists) { // Si l'utilisateur n'existe pas dans la base de données 
      return res.status(404).json({ result: false, error: 'User not found' }); // Renvoyer une erreur 404
    }

    pusher.trigger('chat', 'join', { username, userType }); // Émettre un événement Pusher pour rejoindre le chat 
    res.json({ result: true }); // Renvoyer un message JSON avec le résultat true 
  } catch (error) { // Bloc "catch" pour gérer les erreurs potentielles lors de la vérification de l'utilisateur
    console.error(error); // Afficher l'erreur dans la console
    res.status(500).json({ result: false, error: 'Server error' }); // Renvoyer une erreur 500
  }
});

//-------------------------   Quitter le chat --------------------------------
router.delete('/users/:username', async (req, res) => { 
  const { username } = req.params; // Récupérer le nom d'utilisateur de la requête
  const { userType } = req.body; // Récupérer le type d'utilisateur de la requête

  try { // Bloc "try" pour gérer les erreurs potentielles lors de la sortie du chat
    pusher.trigger('chat', 'leave', { username, userType });  // Émettre un événement Pusher pour quitter le chat 
    res.json({ result: true }); // Renvoyer un message JSON avec le résultat true
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: 'Error while leaving the chat' });
  }
});

//-------------------------   Envoyer un message --------------------------------
router.post('/messages', async (req, res) => {
  const { text, username, userType } = req.body; // Récupérer le texte, le nom d'utilisateur et le type d'utilisateur de la requête

  if (!text || !username || !userType) { // Vérifier si les champs requis sont manquants 
    return res.status(400).json({ result: false, error: 'Missing required fields' }); // Renvoyer une erreur 400
  }

  try { // Bloc "try" pour gérer les erreurs potentielles lors de l'envoi du message
    // Créer un nouveau message
    const newMessage = new Messages({ text, username, userType }); // Création d'une nouvelle instance de la classe Messages
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
