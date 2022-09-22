/* ROUTES */
/* Relie les requêtes à la méthode du controlleur qui leur correspond */

const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const postCtrl = require('../controllers/post');

//relie la route / (get) à la méthode getAllPosts du controller
router.get('/', auth, postCtrl.getAllPosts);
//relie la route / (post) à la méthode createPost du controller
router.post('/', auth, multer, postCtrl.createPost);
//relie la route / (get) à la méthode getOnePost du controller
router.get('/:id', auth, postCtrl.getOnePost);
//relie la route / (put) à la méthode modifyPost du controller
router.put('/:id', auth, multer, postCtrl.modifyPost);
//relie la route / (post) à la méthode modifyLike du controller
router.post('/:id/like', auth, postCtrl.modifyLike);
//relie la route / (delete) à la méthode deletePost du controller
router.delete('/:id', auth, postCtrl.deletePost);

module.exports = router;