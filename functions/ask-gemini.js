const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function (event) {
  // --- শুধু POST রিকোয়েস্ট গ্রহণ করার জন্য নিরাপত্তা ব্যবস্থা ---
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // --- Netlify-এর গোপন জায়গা থেকে API Key নেওয়া ---
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        throw new Error("API Key not found. Please set it in Netlify environment variables.");
    }

    // --- Gemini AI-কে চালু করা ---
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // --- ব্যবহারকারীর পাঠানো মেসেজ এবং হিস্ট্রি নেওয়া ---
    const { history, message } = JSON.parse(event.body);

    const chat = model.startChat({
        history: history || [],
    });

    // --- Gemini-কে প্রশ্ন পাঠানো এবং উত্তর নেওয়া ---
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    // --- আসল জাদুটা এখানেই! ---
    // --- আমরা Netlify-কে বলে দিচ্ছি যে, যেকোনো ওয়েবসাইট থেকে আসা অনুরোধকে বিশ্বাস করতে ---
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allows requests from any origin
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: JSON.stringify({ reply: text }),
    };

  } catch (error) {
    // --- যদি কোনো কারণে ভুল হয়, তাহলে এরর মেসেজ পাঠানো ---
    console.error("Error in Gemini function:", error);
    return {
      statusCode: 500,
      headers: { // এররের ক্ষেত্রেও হেডারটা যোগ করা ভালো অভ্যাস
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Sorry, something went wrong with the AI." }),
    };
  }
};
