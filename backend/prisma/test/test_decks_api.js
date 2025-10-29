import fetch from 'node-fetch';

const API = process.env.API_BASE || 'http://localhost:3000/api';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

async function assert(condition, msg) {
  if (!condition) {
    console.error('ASSERTION FAILED:', msg);
    process.exit(1);
  }
}

(async function(){
  if (!ADMIN_TOKEN) {
    console.error('Set ADMIN_TOKEN env var to run tests (bearer token)');
    process.exit(1);
  }

  console.log('Testing GET /admin/decks');
  const listRes = await fetch(`${API}/admin/decks`, { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } });
  assert(listRes.ok, 'GET /admin/decks failed');
  const listJson = await listRes.json();
  console.log('List decks:', listJson.decks?.length || 0);

  console.log('Creating test deck...');
  const deckName = 'Test Deck';
  const createRes = await fetch(`${API}/admin/decks`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ADMIN_TOKEN}` }, body: JSON.stringify({ name: deckName, description: 'Deck from tests' }) });
  let deck;
  if (createRes.ok) {
    const createJson = await createRes.json();
    deck = createJson.deck;
    console.log('Created deck id:', deck.id);
  } else {
    const err = await createRes.json().catch(()=>({}));
    console.log('Create deck failed, trying to find existing by slug. Error:', err);
    // derive slug same as backend
    const slug = deckName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();
    const listRes2 = await fetch(`${API}/admin/decks?limit=1&slug=${slug}`, { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } });
    if (listRes2.ok) {
      const listJson2 = await listRes2.json();
      deck = (listJson2.decks && listJson2.decks[0]) || null;
      if (deck) console.log('Using existing deck id:', deck.id);
    }
    if (!deck) {
      console.error('Could not create or find test deck');
      process.exit(1);
    }
  }
  console.log('Created deck id:', deck.id);

  console.log('Creating a card in deck...');
  const createCardRes = await fetch(`${API}/admin/decks/${deck.id}/cards`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ADMIN_TOKEN}` }, body: JSON.stringify({ name: 'Test Card', meaning: 'Meaning', deckType: 'CUSTOM' }) });
  assert(createCardRes.ok, 'POST /admin/decks/:deckId/cards failed');
  const createCardJson = await createCardRes.json();
  console.log('Created card id:', createCardJson.card.id);

  console.log('Cleaning up...');
  await fetch(`${API}/admin/decks/${deck.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } });

  console.log('All tests passed');
})();
