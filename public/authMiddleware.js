const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your-secret-key';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Користувач не авторизований.' });
  }

const token = req.headers.authorization?.split(' ')[1];


  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Невалідний токен.' });
  }
}

module.exports = authMiddleware;
