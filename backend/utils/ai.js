const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Summarizes news content into exactly 3 bullet points.
 * @param {string} content - The raw HTML or text content of the news article.
 * @returns {Promise<string[]>} - An array of 3 string bullet points.
 */
async function generateAiSummary(content) {
  if (!content || content.length < 100) return []; // Don't summarize very short posts

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      You are a professional news editor. I will provide you with the content of a news article.
      Your job is to read it and extract the 3 most important key takeaways.
      
      Rules:
      1. Return EXACTLY 3 bullet points. No more, no less.
      2. Each bullet point should be concise (max 2 sentences).
      3. Do not include markdown formatting like * or - in the output strings, just the raw text of the bullet points.
      4. Separate each bullet point with a double newline (\\n\\n).
      
      Article Content:
      ${content.replace(/<[^>]+>/g, '')}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Split by double newline and clean up
    let bullets = text.split('\n\n')
      .map(b => b.trim().replace(/^-\s*/, '').replace(/^\*\s*/, '').replace(/^\d+\.\s*/, ''))
      .filter(b => b.length > 0);
      
    // Guarantee it only returns up to 3 points
    if (bullets.length > 3) {
      bullets = bullets.slice(0, 3);
    }
    
    return bullets;
  } catch (error) {
    console.error('AI Summary Generation Error:', error);
    return []; // Return empty array if generation fails so it doesn't break the app
  }
}

module.exports = { generateAiSummary };
