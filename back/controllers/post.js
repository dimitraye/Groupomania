
//Importe le modèle post pour créer une post
const Post = require('../models/post');
//Importe le modèle fs pour lire des fichiers
const fs = require('fs');


//Fonction pour créer un post
exports.createPost = (req, res, next) => {
    console.log('req.body', req.body);
    console.log('req.body.post', req.body.post);
    //Transforme le  post au format JSON en un objet post
    const postObject = JSON.parse(req.body.post);
    //supprime l'attribut id de post lors de sa création car la base de donnée va lui en attribuer un automatiquement 
    delete postObject._id;
    //suppression du userId pour récuperer celui lié à la requête d'authentification
    delete postObject._userId;
    const post = new Post({
    //... premet d'attribuer toutes propriétés d'un objet (postObject) à un autre objet (post)
    ...postObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        //initialise les likes/ dislikes à 0 et usersLiked/usersDisliked vides comme demandé dans les spécs
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
        date: new Date()
    });

    //Enregistre le post dans la base de donnés 
    post.save()
    //Renvoie une réponse dont le status est 201 et dont le message est au format JSON
    .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
    //En cas d'erreur , renvoie une réponse dont le status est 400 et dont le message est au format JSON
    .catch(error => { res.status(400).json({ error : "Problème lors de l'enregistrement du post" }) })
};

//Récupère un post via son Id
exports.getOnePost = (req, res, next) => {
  //Cherche un post en fonction de son Id
  Post.findOne({
        _id: req.params.id
    }).then(
    //Renvoie une réponse dont le status est 200 et dont le message est l'objet post au format JSON
    (post) => {
            res.status(200).json(post);
        }
    ).catch(
    //Renvoie une réponse dont le status est 404 (not found : dans notre cas, cela signifie que l'on a pas trouvé de post) et dont le message est au format JSON
    (error) => {
            res.status(404).json({
                error: "Post introuvable"
            });
        }
    );
};

//Met à jour un post
exports.modifyPost = (req, res, next) => {
    console.log('req.auth.userRole',req.auth.userRole);
    //créer un objet Post
    //si le fichier existe déjà, attribuer tous les éléments JSON à postObject
    //Sinon 
    const postObject = req.file ? 
    {
        ...JSON.parse(req.body.post),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      } : 
      
      { ...req.body };

    //Efface le userId de post car l'objet post en possède déjà un
    delete postObject._userId;
    //Cherche le post en fonction de son Id
    Post.findOne({ _id: req.params.id })
        .then((post) => {
      //Si le userId est différent de celui enregistré dans la base de donnée
      if (!((post.userId == req.auth.userId) || (req.auth.userRole == 'admin'))) {
        //Renvoie une réponse dont le status est 401 et dont le message est au format JSON
        res.status(401).json({ message: 'Not authorized' });
            } else {
        //Sinon met à jour l'id 
        Post.updateOne({ _id: req.params.id }, { ...postObject, _id: req.params.id })
        //Renvoie une réponse dont le status est 200 et dont le message est au format JSON
        .then(() => res.status(200).json({ message: 'Objet modifié!' }))
          //Renvoie une réponse dont le status est 401 et dont le message est au format JSON
          .catch(error => res.status(401).json({ error : "Problème lors de la modification" }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error : "Post introuvable" });
        });
};

//Met à jour le nombre de likes/dislikes
exports.modifyLike = (req, res, next) => {
    const userId = req.body.userId;
    //transforme like au format string en Int
    const like = parseInt(req.body.like);
    const id = req.params.id;
    let newPost;
  //Cherche du post en fonction de son id
  Post.findOne({ _id: id })
        .then((post) => {
      //Mise à jour  de l'objet post 
            newPost = likeDislike(userId, like, post);
      //Renvoie une réponse dont le status est 200 et dont le message est au format JSON
      Post.updateOne({ _id: id }, { ...newPost })
                .then(() => res.status(200).json({ message: 'Objet modifié!' }))
        //Renvoie une réponse dont le status est 401 et dont le message est au format JSON
        .catch(error => res.status(401).json({ error : "Problème lors de la modification du post" }));

        })
        .catch((error) => {
      //Renvoie une réponse dont le status est 400 et dont le message est au format JSON
      res.status(400).json({ error : "Post introuvable" });
        });
};

//Supprime un post
exports.deletePost = (req, res, next) => {
    Post.findOne({ _id: req.params.id })
        .then(post => {
      //Si userId du post est différent de celui de la requête
      if (!((post.userId == req.auth.userId) || (req.auth.userRole == 'admin'))) {
        //Renvoie une réponse dont le status est 401 et dont le message est au format JSON
        res.status(401).json({ message: 'Not authorized' });
            } else {           
          /* Sépare la chaîne de caractères en deux parties : 1-la première partie contient l'url jusqu'à /images/ comprit 
            2-la deuxième partie après /images/ (soit le nom de l'image)
            EXEMPLE : 
            http://localhost:3000/images/media.auchan.1664106546363.jpg
            =
            [ "http://localhost:3000/images/" , "media.auchan.1664106546363.jpg"]
          */      
            const filename = post.imageUrl.split('/images/')[1];
                //Supprime l'image du dossier image
                fs.unlink(`images/${filename}`, () => {
          //Efface un post en fonction de son id
          Post.deleteOne({ _id: req.params.id })
            //Renvoie une réponse dont le status est 200 et dont le message est au format JSON
            .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
            //Renvoie une réponse dont le status est 401 et dont le message est au format JSON
            .catch(error => res.status(401).json({ error : "Problème lors de la suppression du post" }));
                });
            }
        })
        .catch(error => {
      //Renvoie une réponse dont le status est 500 et dont le message est au format JSON
      res.status(500).json({ error : "Post introuvable" });
        });
};

//Affiche toutes les posts
exports.getAllPosts = (req, res, next) => {
  //On récupère tous les posts avec la fontion find()
  Post.find().then(
        (posts) => {
            //Tri les posts par date par ordre antéchronologique
            posts = posts.sort(
                (objA, objB) => objB.date.getTime() - objA.date.getTime()
            );
      //Renvoie une réponse dont le status est 200 et dont les objets (posts) sont au format JSON
      res.status(200).json(posts);
        }
    ).catch(
    //Renvoie une réponse dont le status est 400 et dont le message est au format JSON
    (error) => {
            res.status(400).json({
                error: "Impossible de récupérer les posts"
            });
        }
    );
};

//fonction qui like/dislike un post
function likeDislike(userId, like, post) {
    let newPost = {};
    newPost._id = post._id;
  //Cas 1
  //On clique sur like pour la première fois
  if (like == 1) {
        //verifier si mon unserId se trouve dans le tableau des usersLiked
        if (!post.usersLiked.includes("userId")) {
            //Si UserId n'est pas dans post.usersLiked -> y ajouter userId 
            post.usersLiked.push(userId);
            // incrémenter post.likes de 1
            post.likes += 1;
      //Mise à jour l'objet newpost en ajoutant les propriétés (likes, usersLiked)
      newPost = { likes: post.likes, usersLiked: post.usersLiked };
        }
    }
  //Cas 2
  //On clique sur dislike pour la première fois
  else if (like == -1) {
        //verifier si mon unserId se trouve dans le tableau des usersDisliked
        if (!post.usersDisliked.includes("userId")) {
            //Si UserId n'est pas dans post.usersLiked -> y ajouter userId 
            post.usersDisliked.push(userId);
            // incrémenter post.likes de 1
            post.dislikes += 1;
      //Mise à jour l'objet newpost en ajoutant les propriétés (dislikes, usersDisliked)
      newPost = { dislikes: post.dislikes, usersDisliked: post.usersDisliked };
        }

    }
  //Cas 3
  //On clique sur like ou dislike pour la deuxième fois

    else if (like == 0) {
        //vérifie si le userId est dans usersLikded -> on annule le like
        if (post.usersLiked.includes(userId)) {
            //supprimer userId du tableau usersLiked
            post.usersLiked = post.usersLiked.filter(idUser => idUser != userId);
            //decrementer post.likes de 1
            post.likes -= 1;
            newPost = { likes: post.likes, usersLiked: post.usersLiked };
        }
        //vérifie si le userId est dans le tableau usersDislikded
        else if (post.usersDisliked.includes(userId)) {
            //supprimer userId du tableau usersDisliked
            post.usersDisliked = post.usersDisliked.filter(idUser => idUser != userId);
            //decrementer post.likes de 1
            post.dislikes -= 1;
      //Mise à jour l'objet newpost en ajoutant les propriétés (dislikes, usersDisliked)
      newPost = { dislikes: post.dislikes, usersDisliked: post.usersDisliked };
        }
    }
  //On retourne un objet post mis à jour
  return newPost;
}

