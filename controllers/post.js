

const Post = require('../models/post');
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
        .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
        .catch(error => { res.status(400).json({ error }) })
};


//Récupère un post via son Id
exports.getOnePost = (req, res, next) => {
    Post.findOne({
        _id: req.params.id
    }).then(
        (post) => {
            res.status(200).json(post);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

//Met à jour un post
exports.modifyPost = (req, res, next) => {
    //créer un objet Post
    //si le fichier existe déjà, attribuer tous les éléments JSON à postObject
    //Sinon 
    const postObject = req.file ? {
        ...JSON.parse(req.body.post),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    //
    delete postObject._userId;
    Post.findOne({ _id: req.params.id })
        .then((post) => {
            if (post.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                Post.updateOne({ _id: req.params.id }, { ...postObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet modifié!' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

//Met à jour le nombre de likes/dislikes
exports.modifyLike = (req, res, next) => {
    const userId = req.body.userId;
    //transforme like au format string en Int
    const like = parseInt(req.body.like);
    const id = req.params.id;
    let newPost;
    Post.findOne({ _id: id })
        .then((post) => {

            newPost = likeDislike(userId, like, post);
            Post.updateOne({ _id: id }, { ...newPost })
                .then(() => res.status(200).json({ message: 'Objet modifié!' }))
                .catch(error => res.status(401).json({ error }));

        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

//Supprime un post
exports.deletePost = (req, res, next) => {
    Post.findOne({ _id: req.params.id })
        .then(post => {
            if (post.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = post.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Post.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

//Affiche toutes les posts
exports.getAllPosts = (req, res, next) => {
    Post.find().then(
        (posts) => {
            posts = posts.sort(
                (objA, objB) => objB.date.getTime() - objA.date.getTime()
            );
            res.status(200).json(posts);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

//fonction qui like/dislike un post
function likeDislike(userId, like, post) {
    let newPost = {};
    newPost._id = post._id;
    //si like == 1 on gère les likes
    if (like == 1) {
        //verifier si mon unserId se trouve dans le tableau des usersLiked
        if (!post.usersLiked.includes("userId")) {
            //Si UserId n'est pas dans post.usersLiked -> y ajouter userId 
            post.usersLiked.push(userId);
            // incrémenter post.likes de 1
            post.likes += 1;
            newPost = { likes: post.likes, usersLiked: post.usersLiked };
        }
    }//on gère le cas des dislikes
    else if (like == -1) {
        //verifier si mon unserId se trouve dans le tableau des usersDisliked
        if (!post.usersDisliked.includes("userId")) {
            //Si UserId n'est pas dans post.usersLiked -> y ajouter userId 
            post.usersDisliked.push(userId);
            // incrémenter post.likes de 1
            post.dislikes += 1;
            newPost = { dislikes: post.dislikes, usersDisliked: post.usersDisliked };
        }

    }//Annulation du like ou du dislike
    else if (like == 0) {
        //vérifie si le userId est dans usersLikded -> on annule le like
        if (post.usersLiked.includes(userId)) {
            //supprimer userId du tableau usersLiked
            post.usersLiked = post.usersLiked.filter(idUser => idUser != userId);
            //decrementer post.likes de 1
            post.likes -= 1;
            newPost = { likes: post.likes, usersLiked: post.usersLiked };
        }//Annulation du dislike
        else if (post.usersDisliked.includes(userId)) {
            //supprimer userId du tableau usersDisliked
            post.usersDisliked = post.usersDisliked.filter(idUser => idUser != userId);
            //decrementer post.likes de 1
            post.dislikes -= 1;
            newPost = { dislikes: post.dislikes, usersDisliked: post.usersDisliked };
        }
    }
    return newPost;
}

