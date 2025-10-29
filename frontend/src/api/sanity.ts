// Funciones para consumir la API de Sanity (blog)
import { SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN } from '../config/sanity';

const BASE_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${SANITY_DATASET}`;

export async function fetchPosts() {
  const query = encodeURIComponent('*[_type == "post"]{_id, title, slug, body, categories, publishedAt}');
  const res = await fetch(`${BASE_URL}?query=${query}`, {
    headers: { Authorization: `Bearer ${SANITY_API_TOKEN}` }
  });
  const data = await res.json();
  return data.result;
}

export async function fetchCategories() {
  const query = encodeURIComponent('*[_type == "category"]{_id, title, description}');
  const res = await fetch(`${BASE_URL}?query=${query}`, {
    headers: { Authorization: `Bearer ${SANITY_API_TOKEN}` }
  });
  const data = await res.json();
  return data.result;
}

export async function fetchPostBySlug(slug: string) {
  const query = encodeURIComponent(`*[_type == "post" && slug.current == "${slug}"][0]{_id, title, body, categories, publishedAt}`);
  const res = await fetch(`${BASE_URL}?query=${query}`, {
    headers: { Authorization: `Bearer ${SANITY_API_TOKEN}` }
  });
  const data = await res.json();
  return data.result;
}
