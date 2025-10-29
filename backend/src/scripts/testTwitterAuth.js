import { TwitterApi } from 'twitter-api-v2';
import 'dotenv/config';

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

async function test() {
  try {
    const me = await client.v2.me();
    console.log('Autenticación correcta. Usuario:', me);
    await client.v2.tweet('Test de autenticación Twitter/X desde Nebulosa Mágica.');
    console.log('Tweet enviado correctamente');
  } catch (e) {
    console.error('Error Twitter/X:', e);
  }
}

test();
