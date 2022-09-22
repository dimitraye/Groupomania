const express = require('express');

const app = express();

const mongoose = require('mongoose');

const postRoutes = require('./routes/post');

const userRoutes = require('./routes/user');

const path = require('path');

require('dotenv').config();

//Connexion à la base de donnée 
mongoose.connect('mongodb+srv://'+process.env.DB_USER+':'+process.env.DB_PASSWORD+'@cluster0.5ujafkx.mongodb.net/?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'
    ));

app.use(express.json());


app.use((req, res, next) => {
    //d'accéder à notre API depuis n'importe quelle origine ( '*' ) ;
    res.setHeader('Access-Control-Allow-Origin', '*');
    //d'ajouter les headers mentionnés aux requêtes envoyées vers notre API (Origin , X-Requested-With , etc.) ;
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    //d'envoyer des requêtes avec les méthodes mentionnées ( GET ,POST , etc.).
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});





//routes liées à la gestion posts
app.use('/api/posts', postRoutes);
//routes liées à la gestion users
app.use('/api/auth', userRoutes);
//route lié à à la gestion de l'image (stockage)
app.use('/images', express.static(path.join(__dirname, 'images')));



module.exports = app;