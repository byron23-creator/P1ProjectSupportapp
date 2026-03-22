const { AuthService } = require('../../Soporte.Infrastructure/Services/AuthService');

const authService = new AuthService();

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or malformed token.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: `Unauthorized: ${err.message}` });
  }
}

// authorize(...roles) debe usarse DESPUÉS de authenticate
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: No user context.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Role "${req.user.role}" is not allowed. Required: [${roles.join(', ')}].`,
      });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
