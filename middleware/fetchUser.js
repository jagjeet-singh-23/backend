const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'routes/.env.local' });
const jwt_secret = process.env.JWT_SECRET;

const fetchUser = (req, res, next) => {
    // Get the user from JWT token and add id to req object
    const token = req.header('authToken');
    if (!token)
        res.status(401).send({ error: "Invalid token" });
    try {
        const data = jwt.verify(token, jwt_secret);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({ error: "Invalid token" });
    }
}
module.exports = fetchUser;