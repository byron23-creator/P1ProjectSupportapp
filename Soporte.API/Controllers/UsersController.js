// Rutas montadas en /api/users
// POST /auth/login  → público | body: { email, password }
// GET  /me          → L1, L2
// GET  /            → L1, L2
// GET  /:id         → L1, L2
const { Router } = require('express');
const { authenticate } = require('../Middleware/authMiddleware');

const { LoginUseCase } = require('../../Soporte.Application/UseCases/LoginUseCase');

const { UserRepository } = require('../../Soporte.Infrastructure/Repositories/UserRepository');
const { AuthService }    = require('../../Soporte.Infrastructure/Services/AuthService');

const userRepository = new UserRepository();
const authService    = new AuthService();
const loginUseCase   = new LoginUseCase(userRepository, authService);

const router = Router();

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required.' });
    }
    const result = await loginUseCase.execute({ email, password });
    return res.status(200).json({ data: { token: result.token, user: result.user } });
  } catch (err) {
    console.error('[UsersController] POST /auth/login:', err.message);
    const isAuthError = err.message.includes('Invalid credentials');
    return res.status(isAuthError ? 401 : 400).json({ error: err.message });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await userRepository.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.status(200).json({ data: user.toPublic() });
  } catch (err) {
    console.error('[UsersController] GET /me:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const users = await userRepository.findAll();
    return res.status(200).json({ data: users.map((u) => u.toPublic()) });
  } catch (err) {
    console.error('[UsersController] GET /:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await userRepository.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: `User "${req.params.id}" not found.` });
    }
    return res.status(200).json({ data: user.toPublic() });
  } catch (err) {
    console.error('[UsersController] GET /:id:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
