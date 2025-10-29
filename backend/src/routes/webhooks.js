import express from 'express';
import { brevoWebhookHandler } from '../controllers/emailWebhookController.js';

const router = express.Router();

// Brevo webhook endpoint
router.post('/brevo', express.json(), brevoWebhookHandler);

export default router;
