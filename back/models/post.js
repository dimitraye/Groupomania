/* MODELS */
/* Gère les données et la logique métier */

//Importe le package mongoose qui facilite les intéractions avec MongoDB
const mongoose = require('mongoose');

//Schém d'un post
const postSchema = mongoose.Schema({
    userId: { type: String },
    title: { type: String },
    content: { type: String },
    imageUrl: { type: String},
    likes: { type: Number },
    dislikes: { type: Number },
    usersLiked: { type: [String] },
    usersDisliked: { type: [String] },
    date: {type: Date}
  });

//Rend le modèle accessible dans d'autres fichiers
module.exports = mongoose.model('Post', postSchema);
