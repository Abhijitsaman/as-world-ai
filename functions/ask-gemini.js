const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        throw new Error("API Key not found. Please set it in Netlify environment variables.");
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { history, message } = JSON.parse(event.body);

    const chat = model.startChat({
        history: history || [],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: text }),
    };

  } catch (error) {
    console.error("Error in Gemini function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Sorry, something went wrong with the AI." }),
    };
  }
};
