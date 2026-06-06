require('dotenv').config();
const mongoose = require('mongoose');
const Poll = require('./models/Poll');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Clear old
  await Poll.deleteMany({});
  
  const p = new Poll({
    question: "Which AI model do you think is currently the smartest?",
    options: [
      { text: "Google Gemini 1.5 Pro", votes: 42 },
      { text: "OpenAI GPT-4o", votes: 38 },
      { text: "Anthropic Claude 3.5 Sonnet", votes: 35 },
      { text: "Meta Llama 3", votes: 12 }
    ]
  });
  
  await p.save();
  console.log("Seeded poll:", p);
  
  mongoose.disconnect();
}

seed();
