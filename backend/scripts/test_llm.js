import { interpretReadingAI } from '../src/services/llmService.js';

async function main(){
  try{
    const mockCards = [
      { position:1, card: { id:'rw-1', name:'El Mago', reversed:false, meaning:'Habilidad y recurso', deckType:'RIDER_WAITE'}},
      { position:2, card: { id:'rw-2', name:'La Suma Sacerdotisa', reversed:false, meaning:'Intuición', deckType:'RIDER_WAITE'}},
      { position:3, card: { id:'rw-3', name:'La Emperatriz', reversed:true, meaning:'Fertilidad', deckType:'RIDER_WAITE'}}
    ];
    const resp = await interpretReadingAI('TAROT','tres-cartas','¿Qué debo saber hoy?', mockCards, 'rider-waite');
    console.log('LLM response:', resp);
  }catch(e){
    console.error('LLM test error:', e);
    process.exit(1);
  }
}

main();
