const jwt = require('jsonwebtoken');
const {fetchSecrets} = require('../vault/vault-client');

const authenticate = async(req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const secrets = await fetchSecrets();
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, secrets.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authenticate;

