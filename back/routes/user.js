/* ROUTES */
/* Relie les requêtes à la méthode du controlleur qui leur correspondent */

const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');

//relie la route signup à la méthode signup du controller(creation d'un utilisateur)
router.post('/signup', userCtrl.signup);
//relie la route login à la méthode login du controller(connexion d'un utilisateur)
router.post('/login', userCtrl.login);

module.exports = router;