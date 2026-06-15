const express = require('express');
const jwt = require('jsonwebtoken');
const { Users } = require('./models');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRY = parseInt(process.env.JWT_EXPIRY, 10) || 86400;

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

function buildUserPayload(user) {
  const firstName = user.first_name || user.firstName || '';
  const lastName = user.last_name || user.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    id: user.id,
    email: user.email,
    name: fullName || undefined,
    role: user.role,
  };
}

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    console.error('Auth token invalid:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await Users.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await Users.verifyPassword(user, password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await Users.updateLastLogin(user.id);
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return res.json({ user: buildUserPayload(user), token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existingUser = await Users.findByEmail(normalizedEmail);
  if (existingUser) {
    return res.status(409).json({ error: 'Email is already registered' });
  }

  try {
    const [firstName, ...rest] = String(name || '').trim().split(/\s+/);
    const lastName = rest.join(' ');
    const user = await Users.create({
      email: normalizedEmail,
      password,
      firstName,
      lastName,
      role: 'analyst'
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return res.status(201).json({ user: buildUserPayload(user), token });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Signup failed' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ user: buildUserPayload(user) });
  } catch (error) {
    console.error('Auth me error:', error);
    return res.status(500).json({ error: 'Failed to load authenticated user' });
  }
});

module.exports = {
  router,
  authenticateToken,
  signToken,
};
