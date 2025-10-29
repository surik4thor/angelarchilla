// Servicio para publicar tweets usando las claves del .env
import { config } from 'dotenv';
config();
import { TwitterApi } from 'twitter-api-v2';

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

export async function publishHoroscopeTweet({ mensaje }) {
  try {
    const tweet = await client.v2.tweet(mensaje);
    return tweet;
  } catch (e) {
    console.error('Error publicando tweet:', e);
    throw e;
  }
}
