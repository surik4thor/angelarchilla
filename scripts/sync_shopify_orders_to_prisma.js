#!/usr/bin/env node

import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

// Discord para informes
const DISCORD_WEBHOOK = 'https://discordapp.com/api/webhooks/1430918926023397498/Nu96uuUl4dK2XRICDQz8BKAnNiIvestXffOofMrA5J1TkuFhh2Rd4jwIFEmb7ONGDT6t';

async function fetchShopifyOrders() {
  const res = await fetch(BASE_URL, {
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_API_TOKEN,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) throw new Error('Error al consultar Shopify: ' + res.status);
  const data = await res.json();
  return data.orders || [];
}

async function syncOrders() {
  const orders = await fetchShopifyOrders();
  let nuevos = 0;
  for (const order of orders) {
    // Buscar usuario por email
    let user = null;
    if (order.email) {
      user = await prisma.user.findUnique({ where: { email: order.email } });
    }
    // Crear usuario si no existe (opcional)
    if (!user && order.email) {
      user = await prisma.user.create({ data: { email: order.email, password: '', role: 'USER' } });
    }
    // Registrar pedido en Prisma si no existe
    const existe = await prisma.order.findUnique({ where: { stripeId: String(order.id) } });
    if (!existe) {
      await prisma.order.create({
        data: {
          userId: user ? user.id : null,
          total: parseFloat(order.total_price),
          status: 'DELIVERED',
          stripeId: String(order.id),
          shippingName: order.shipping_address?.name || '',
          shippingEmail: order.email || '',
          shippingAddress: order.shipping_address?.address1 || '',
          shippingCity: order.shipping_address?.city || '',
          shippingZip: order.shipping_address?.zip || '',
          shippingCountry: order.shipping_address?.country || '',
          items: {
            create: order.line_items.map(item => ({
              productId: item.sku || item.product_id || '',
              quantity: item.quantity,
              price: parseFloat(item.price)
            }))
          }
        }
      });
      nuevos++;
    }
  }
  // Notificar a Discord
  const msg = nuevos > 0
    ? `✅ Sincronización Shopify→Prisma completada. Nuevos pedidos: ${nuevos}`
    : `ℹ️ Sincronización Shopify→Prisma: sin nuevos pedidos.`;
  await fetch(DISCORD_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: msg })
  });
  await prisma.$disconnect();
}

syncOrders().catch(err => {
  console.error('Error en sincronización:', err);
  fetch(DISCORD_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: `❌ Error en sync Shopify→Prisma: ${err.message}` })
  });
  prisma.$disconnect();
});
