const OpenAI = require("openai");

const MODEL = process.env.OPENAI_MODEL || "gpt-4o";
const API_KEY = process.env.OPENAI_API_KEY || "";
const BASE_URL = process.env.OPENAI_API_BASE_URL || "https://api.openai.com/v1";

let client = null;
console.log("[openaiService] API_KEY exists:", !!API_KEY, "BASE_URL:", BASE_URL);
if (API_KEY) {
  try { 
    client = new OpenAI({ 
      apiKey: API_KEY,
      baseURL: BASE_URL
    }); 
  } catch { 
    client = null; 
  }
}

async function invokeOpenAIAgent({ text, correlationId: _correlationId, stream = false }) {
  const input = String(text || "");
  if (!client) { throw new Error("Mammouth AI no configurado: falta OPENAI_API_KEY"); }
  const chatReq = { model: MODEL, messages: [{ role: "user", content: input }] };

  if (!stream) {
    try {
      const response = await client.chat.completions.create(chatReq);
      return {
        output: response.choices[0]?.message?.content || "",
        model: response.model || MODEL,
        id: response.id
      };
    } catch (error) { throw new Error(`Mammouth AI error: ${error.message}`); }
  }

  try {
    const streamResponse = await client.chat.completions.create({ ...chatReq, stream: true });
    let out = "";
    for await (const chunk of streamResponse) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) out += content;
    }
    return { output: out, model: MODEL };
  } catch (error) { throw new Error(`Mammouth AI error: ${error.message}`); }
}

module.exports = { invokeOpenAIAgent };





