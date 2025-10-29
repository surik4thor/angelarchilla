import prisma from '../config/database.js';
import { createClient } from 'redis';

const REDIS_KEY = 'public:decks';
const TTL_SECONDS = 30;

let redisClient = null;
let inMemoryCache = { decks: null, at: 0 };

function getRedisClient() {
  if (redisClient) return redisClient;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    redisClient = createClient({ url });
    // Don't await connect here; connect lazily when first used
    redisClient.on('error', (err) => console.warn('Redis client error:', err));
    redisClient.connect().catch((e) => console.warn('Redis connect failed:', e));
    return redisClient;
  } catch (e) {
    console.warn('Redis not available, falling back to memory cache', e);
    redisClient = null;
    return null;
  }
}

// Devuelve mazos públicos (con cache en Redis; fallback a memoria)
export const listPublicDecksCached = async (req, res) => {
  try {
    const redis = getRedisClient();
    if (redis) {
      try {
        const raw = await redis.get(REDIS_KEY);
        if (raw) {
          const decks = JSON.parse(raw);
          res.setHeader('X-Cache', 'HIT');
          return res.status(200).json({ success: true, decks, cached: true });
        }
      } catch (e) {
        console.warn('Error reading decks from Redis, falling back to DB', e);
      }
    }

    // Memory cache fallback
    const now = Date.now();
    if (inMemoryCache.decks && (now - inMemoryCache.at) < TTL_SECONDS * 1000) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json({ success: true, decks: inMemoryCache.decks, cached: true });
    }

    const decks = await prisma.deck.findMany({
      select: { id: true, slug: true, name: true, type: true, imageUrl: true },
      orderBy: { name: 'asc' }
    });

  // Try to set in Redis (best effort)
    if (redis) {
      try {
        await redis.setEx(REDIS_KEY, TTL_SECONDS, JSON.stringify(decks));
      } catch (e) {
        console.warn('Failed to set decks in Redis cache', e);
      }
    }

  inMemoryCache.decks = decks;
  inMemoryCache.at = Date.now();
  res.setHeader('X-Cache', 'MISS');
  return res.status(200).json({ success: true, decks, cached: false });
  } catch (e) {
    console.error('Error fetching decks (cached):', e);
    res.status(500).json({ success: false, message: 'No se pudieron obtener los mazos' });
  }
};

export async function invalidateDecksCache() {
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.del(REDIS_KEY);
    } catch (e) {
      console.warn('Failed to delete Redis decks cache', e);
    }
  }
  inMemoryCache.decks = null;
  inMemoryCache.at = 0;
}
