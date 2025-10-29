// Archivo: backend/src/routes/auth.js
import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile
} from '../controllers/authController.js';
import { authenticate, optionalAuth, requireMembership } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  validateUpdateProfile
} from '../middleware/validation.js';

const router = express.Router();

// Rutas públicas
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Rutas protegidas
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, validateUpdateProfile, updateProfile);

export default router;