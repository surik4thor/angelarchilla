import fetch from 'node-fetch';

const API = process.env.API_BASE || 'http://localhost:5050/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'surik4thor@icloud.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123456';

function assert(cond, msg) { if (!cond) { console.error('ASSERTION FAILED:', msg); process.exit(1); } }

(async function(){
  console.log('Logging in...');
  const loginRes = await fetch(`${API}/auth/login`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }) });
  assert(loginRes.ok, 'login failed');
  const loginJson = await loginRes.json();
  const token = loginJson.token;
  console.log('Token acquired');

  console.log('GET /decks (before)');
  const listRes1 = await fetch(`${API}/decks`);
  assert(listRes1.ok, 'GET /decks failed');
  const listJson1 = await listRes1.json();
  console.log('Decks before:', listJson1.decks.map(d=>d.slug).join(', '));

  console.log('Creating test deck');
  const deckName = `integration-test-${Date.now()}`;
  const createRes = await fetch(`${API}/admin/decks`, { method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ name: deckName, description: 'Integration test deck' }) });
  assert(createRes.ok, 'create deck failed');
  const createJson = await createRes.json();
  const deck = createJson.deck;
  console.log('Created deck:', deck.id, deck.slug);

  console.log('GET /decks (after create)');
  const listRes2 = await fetch(`${API}/decks`);
  assert(listRes2.ok, 'GET /decks failed after create');
  const listJson2 = await listRes2.json();
  assert(listJson2.decks.find(d=>d.id === deck.id), 'New deck not found in public list');
  console.log('Decks after create contains new deck.');

  console.log('Deleting the test deck');
  const delRes = await fetch(`${API}/admin/decks/${deck.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
  assert(delRes.ok, 'delete deck failed');
  console.log('Deleted test deck');

  console.log('GET /decks (after delete)');
  const listRes3 = await fetch(`${API}/decks`);
  assert(listRes3.ok, 'GET /decks failed after delete');
  const listJson3 = await listRes3.json();
  assert(!listJson3.decks.find(d=>d.id === deck.id), 'Deleted deck still present');

  console.log('Integration test passed');
})();
