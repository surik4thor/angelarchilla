import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

// Cache simple en memoria
let postsCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 1000; // 1 minuto

export function getAllPosts() {
  if (postsCache && Date.now() - cacheTimestamp < CACHE_TTL) {
    return postsCache;
  }
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  const posts = files.map(filename => {
    const filePath = path.join(POSTS_DIR, filename);
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(raw);
    return {
      ...data,
      slug: filename.replace(/\.md$/, ''),
      html: marked(content)
    };
  }).filter(post => post.published);
  postsCache = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  cacheTimestamp = Date.now();
  return postsCache;
}

export function getPostBySlug(slug) {
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  if (!data.published) return null;
  return {
    ...data,
    slug,
    html: marked(content)
  };
}

export function getPostsByTag(tag) {
  return getAllPosts().filter(post => post.tags?.includes(tag));
}

export function getRecentPosts(limit = 5) {
  return getAllPosts().slice(0, limit);
}
