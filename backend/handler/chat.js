import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai"
import { json } from "express";
dotenv.config()

/*
Request format
{
    "ingredient":["ส้ม", "ชมพู่", "มะละกอ"], 
    "style":"", 
    "role":"ของหวาน", 
    "cuisine":"" 
}

*/
let lastSent = [];

export const requestAI = async (req, res) => {
    //const {ingredient, style, role, cuisine} = req.body;
  const {ingredients, style = "ใดก็ได้", role = "", cuisine = "ไหนก็ได้"} = req.body;
  if (!ingredients) {
    return res.status(400).json({ error: "missing message" });
  }

  var formatPrompt = `สร้างเมนู${role}ที่ปรุงด้วยวิธี${style}และเป็นอาหารชาติ${cuisine}`
  formatPrompt += "มา 5 เมนู โดยวัตถุดิบหลักต้องใช้วัตถุดิบต่อไปนี้เท่านั้น"
  ingredients.forEach((e, id) => {
    formatPrompt += `${id+1}. ${e}\n`
  });
  formatPrompt += "\n strictly follow these rule: 1. response should be the JSON array of menus 2. respond in Thai language  3. no other suggestion or code closure (```). just JSON objects text"
  formatPrompt += `\n 4. Example of a menu json structure { "name":"ชื่อเมนู", "desc":"รายละเอียดเมนู", "ingredientsUsed": ["วัตถุดิบที่ 1", "วัตถุดิบที่ 2", "วัตถุดิบที่ 3", ...]}`

  const ai = "google";
  const userIP = req.ip;
  const now = Date.now();

  if (lastSent[userIP] && now - lastSent[userIP] < 1000) {
    return res
      .status(429)
      .json({ error: "คุณส่งข้อความเร็วเกินไป กรุณารอ 1 วินาที" });
  }

  lastSent[userIP] = now;

  try {
    let response, content;

    if (ai === "openrouter") {
      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.AI_APIKEY}`,
          "HTTP-Referer": "localhost",
          "X-Title": "Localhost",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-nano-9b-v2:free",
          messages: [{ role: "user", content: formatPrompt }],
        }),
      });

      const json = await response.json();
      content = json.choices[0].message.content;

    } else if (ai === "google") {
      const genAI = new GoogleGenAI({});
      response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: formatPrompt,
      });

      console.log(response.text);
      content = response.text;
    }

    return res.json(JSON.parse(content));

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal error" });
  }
}