/* ROUTES */
/* Relie les requêtes à la méthode du controlleur qui leur correspondent */

//Importe le package express qui est un framework facilitant la gestion de serveur node.js
const express = require('express');
//Création d'un noueau router
const router = express.Router();
//Importe le fichier user depuis le dossier controllers 
const userCtrl = require('../controllers/user');

//relie la route signup à la méthode signup du controller(creation d'un utilisateur)
router.post('/signup', userCtrl.signup);
//relie la route login à la méthode login du controller(connexion d'un utilisateur)
router.post('/login', userCtrl.login);

//Rend le module accessible dans d'autres fichiers
module.exports = router;