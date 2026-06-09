// middlewares/validate.js
// Middleware générique de validation du corps de la requête (req.body).
// Au lieu de dupliquer la logique de validation dans chaque controller,
// on la centralise ici. Ce middleware est une "factory" : il prend un
// schéma Joi en paramètre et retourne un middleware Express.
//
// Utilisation dans une route :
//   router.post('/register', validate(registerSchema), register);
//
// Si la validation échoue, la requête s'arrête ici avec une erreur 400.
// Si elle réussit, on passe au prochain middleware (next()).

const validate = (schema) => {
  return (req, res, next) => {
    // abortEarly: false → retourne TOUTES les erreurs d'un coup,
    // pas juste la première. Plus pratique pour le client.
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      // On extrait les messages d'erreur Joi et on les formate proprement
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        status: 400,
        message: 'Données invalides.',
        errors: messages,
      });
    }

    // Validation OK, on passe au controller
    next();
  };
};

module.exports = validate;
