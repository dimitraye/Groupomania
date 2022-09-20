const User = require("../models/user");
const bcrypt = require("bcrypt"); //gère le hachage du mdp
const jwt = require("jsonwebtoken"); //Génère le token d'authentification
//Module servant à vérifier la validité d'un email
const emailvalidator = require("email-validator");

//Création d'un utilisateur
exports.signup = (req, res, next) => {
  //Vérifie si le format de l'email est valide
  if (!req.body.email || !emailvalidator.validate(req.body.email)) {
    res.status(400).send({ error: "Email ou Mot de Passe Invalide" });
    throw "Erreur : Email ou Mot de Passe Invalide";
  }
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      //sauvegarde l'utilisateur
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) =>
          res
            .status(400)
            .json({ error: "Impossible d'enregistrer l'utilisateur" })
        );
    })
    .catch((error) =>
      res.status(500).json({ error: "Erreur lors du cryptage du mot de passe" })
    );
};

//Connexion
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      //compare  si le mdp de la requête correspond au mdp dans la BD
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user._id,
            role: user.role,
            //Attribut un token d'authentification
            token: jwt.sign(
              { userId: user._id, role: user.role },
              "RANDOM_TOKEN_SECRET",
              //Le token est valide pendant 24h
              { expiresIn: "24h" }
            ),
          });
        })
        .catch((error) =>
          res.status(500).json({ error: "Email ou mot de passe érroné" })
        );
    })
    .catch((error) =>
      res.status(500).json({ error: "Email ou mot de passe érroné" })
    );
};
