import express from 'express';
import User from '../models/User.js';
const axios = require('axios');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const user = new User({ name, email, password, role });
  await user.save();
  res.send({ message: 'User registered successfully' });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (user) res.send({ message: 'Login success', role: user.role });
  else res.status(400).send({ message: 'Invalid credentials' });
});

export default router;
