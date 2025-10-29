// Funciones para consumir la API de Shopify (productos)
import { SHOPIFY_STORE_DOMAIN, SHOPIFY_API_TOKEN } from '../config/shopify';

const BASE_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/2023-04/graphql.json`;

export async function fetchProducts() {
  const query = `{
    products(first: 20) {
      edges {
        node {
          id
          title
          description
          images(first: 1) { edges { node { src } } }
          variants(first: 1) { edges { node { price } } }
        }
      }
    }
  }`;
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'X-Shopify-Storefront-Access-Token': SHOPIFY_API_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  return data.data.products.edges.map((e: any) => e.node);
}

export async function fetchProductById(id: string) {
  const query = `{
    product(id: "${id}") {
      id
      title
      description
      images(first: 5) { edges { node { src } } }
      variants(first: 5) { edges { node { price, title } } }
    }
  }`;
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'X-Shopify-Storefront-Access-Token': SHOPIFY_API_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  return data.data.product;
}
