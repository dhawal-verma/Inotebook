const jwt = require('jsonwebtoken');
const JWT_SECRET = 'weknowthat!';

const fetchUser = (req, res, next) => {
    const token = req.header('authtoken');
    if (!token) {
        res.status(401).send({
            error: "Please authenticate using a valid token"
        })
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        // console.log(data.user)
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({
            error: "Please authenticate using a valid token"
        })
    }
}


module.exports = fetchUser;