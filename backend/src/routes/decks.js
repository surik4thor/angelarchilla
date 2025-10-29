import express from 'express';
import { listPublicDecksCached as listPublicDecks } from '../controllers/deckController.js';

const router = express.Router();

router.get('/', listPublicDecks);

export default router;
