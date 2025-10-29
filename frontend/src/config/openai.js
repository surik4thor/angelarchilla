export const OPENAI = {
  key: import.meta.env.VITE_OPENAI_API_KEY,
  url: import.meta.env.VITE_OPENAI_API_URL,
  model: import.meta.env.VITE_OPENAI_MODEL,
  functions: [
    {
      name: "generateReading",
      description: "Genera cartas o runas según tirada",
      parameters: {
        type: "object",
        properties: {
          readingType: { type: "string", enum: ["tarot","runes"] },
          spreadType: { type: "string" },
          deckType: { type: "string" }
        },
        required: ["readingType","spreadType"]
      }
    },
    {
      name: "interpretReading",
      description: "Interpreta tirada de tarot o runas",
      parameters: {
        type: "object",
        properties: {
          readingType:{type:"string",enum:["tarot","runes"]},
          spreadType:{type:"string"},
          question:{type:"string"},
          cards:{type:"array",items:{type:"object"}}
        },
        required:["readingType","spreadType","question","cards"]
      }
    },
    {
      name: "generateHoroscope",
      description: "Genera horóscopo diario personalizado",
      parameters: {
        type:"object",
        properties:{
          birthDate:{type:"string"},
          zodiacSign:{type:"string"},
          readingHistory:{type:"array",items:{type:"object"}}
        },
        required:["birthDate","zodiacSign"]
      }
    }
  ]
};
