const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    console.log('req', req);
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        const userId = decodedToken.userId;
        const userRole = decodedToken.role;
        req.auth = {
            userId: userId,
            userRole: userRole
        };
        next();
    } catch (error) {
        res.status(401).json({ error });
    }
};