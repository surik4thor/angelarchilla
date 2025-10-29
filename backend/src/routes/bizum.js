import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateBizumPayment } from '../controllers/bizumController.js';

const router = express.Router();

// Endpoint para validar pago Bizum
router.post('/validate', authenticate, validateBizumPayment);

export default router;
