/* MODELS */
/* Gère les données et la logique métier */

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
    usersDisliked: { type: [String] }
  });

module.exports = mongoose.model('Post', postSchema);