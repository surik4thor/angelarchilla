import express from 'express';
import {
  getAllPosts,
  getPostBySlug,
  getPostsByTag,
  getRecentPosts
} from '../helpers/markdownParser.js';

const router = express.Router();

// GET /api/posts
router.get('/posts', (req, res) => {
  try {
    const posts = getAllPosts();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener posts' });
  }
});

// GET /api/posts/:slug
router.get('/posts/:slug', (req, res) => {
  const post = getPostBySlug(req.params.slug);
  if (!post) return res.status(404).json({ error: 'Post no encontrado' });
  res.json(post);
});

// GET /api/posts/tag/:tag
router.get('/posts/tag/:tag', (req, res) => {
  const posts = getPostsByTag(req.params.tag);
  res.json(posts);
});

// GET /api/posts/recent/:limit?
router.get('/posts/recent/:limit?', (req, res) => {
  const limit = parseInt(req.params.limit) || 5;
  const posts = getRecentPosts(limit);
  res.json(posts);
});

export default router;
