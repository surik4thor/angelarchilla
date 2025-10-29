// DELETE /api/admin/blog/:slug
router.delete('/admin/blog/:slug', (req, res) => {
  const filePath = path.join(POSTS_DIR, `${req.params.slug}.md`);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'No encontrado' });
  try {
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el artículo' });
  }
});
// GET /content/posts/:slug.md (servir archivo Markdown para edición)
router.get('/content/posts/:slug.md', (req, res) => {
  const filePath = path.join(POSTS_DIR, `${req.params.slug}.md`);
  if (!fs.existsSync(filePath)) return res.status(404).send('No encontrado');
  res.sendFile(filePath);
});
import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

// POST /api/admin/blog
router.post('/admin/blog', (req, res) => {
  const { slug, content } = req.body;
  if (!slug || !content) return res.status(400).json({ error: 'Slug y contenido requeridos' });
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar el artículo' });
  }
});

export default router;
