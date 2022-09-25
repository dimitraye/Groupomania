/* ROUTES */
/* Relie les requêtes à la méthode du controlleur qui leur correspond */

//Importe le package express qui est un framework facilitant la gestion de serveur node.js
const express = require('express');
//Création d'un noueau router
const router = express.Router();

//Importe le fichier auth (middleware d'authentification)
const auth = require('../middleware/auth');
//Importe le fichier multer-config (middleware de gestion des fichiers)
const multer = require('../middleware/multer-config');

//Importe le controller post 
const postCtrl = require('../controllers/post');

//relie la route / (get) à la méthode getAllPosts du controller post (récupère tous les posts)
router.get('/', auth, postCtrl.getAllPosts);
//relie la route / (post) à la méthode createPost du controller post (Crée un post)
router.post('/', auth, multer, postCtrl.createPost);
//relie la route / (get) à la méthode getOnePost du controller post (récupère un post)
router.get('/:id', auth, postCtrl.getOnePost);
//relie la route / (put) à la méthode modifyPost du controller post (modifie un post)
router.put('/:id', auth, multer, postCtrl.modifyPost);
//relie la route / (post) à la méthode modifyLike du controller post (modifie un like)
router.post('/:id/like', auth, postCtrl.modifyLike);
//relie la route / (delete) à la méthode deletePost du controller post (efface un post)
router.delete('/:id', auth, postCtrl.deletePost);

//Rend le module accessible dans d'autres fichiers
module.exports = router;