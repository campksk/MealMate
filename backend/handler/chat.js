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
  const {ingredients, style = "any style", role = "anything", cuisine = "any"} = req.body;
  if (!ingredients) {
    return res.status(400).json({ error: "missing message" });
  }

  var formatPrompt = `Create 5 menus of ${role}, cook by ${style}, and be a ${cuisine} cuisine. The menu shall only use ${ingredients}. Other subtle additive is allowed. Each menu should have a name and short description (2-3 sentence). And they are formatted into the JSON. Example of single menu json {"name" : "<menu name>", "desc":"<description>"}. All the menus should be in an array. No need to provide message other than JSON of menus. Each menu content should be written in Thai language. The most important. Do not provide text in markdown format. If the menu can't be create. Return [{"menu":"ไม่สามารถสร้างเมนูตามคำขอได้","desc":""}]`

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