import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai"
dotenv.config()

/*
Request format
{
    "ingredient":["ส้ม", "ชมพู่", "มะละกอ"], 
    "cookMethod":"", 
    "foodRole":"ของหวาน", 
    "nationality":"" 
}

*/

export const requestAI = async (req, res) => {
    //const {ingredient, cookMethod, foodRole, nationality} = req.body;
  const {ingredients, cookMethod = "ใดก็ได้", foodRole = "", nationality = "ไหนก็ได้"} = req.body;
  if (!ingredients) {
    return res.status(400).json({ error: "missing message" });
  }

  var formatPrompt = `สร้างเมนู${foodRole}ที่ปรุงด้วยวิธี${cookMethod}และเป็นอาหารชาติ${nationality}`
  formatPrompt += "มา 10 เมนู โดยวัตถุดิบหลักต้องใช้วัตถุดิบต่อไปนี้เท่านั้น"
  ingredients.forEach((e, id) => {
    formatPrompt += `${id+1}. ${e}\n`
  });
  formatPrompt += "\n ขอ response เป็นรูปแบบ json array ของเมนูแต่ละเมนู ภาษาของเนื้อความเป็นภาษาไทย ไม่ต้องมีข้อความอื่นเพิ่มเติม ไม่ต้องมี code snippet closure (```ปิดหัวท้าย)"
  formatPrompt += `\n ตัวอย่างรูปแบบของเมนู {"name":"ชื่อเมนู", "desc":"รายละเอียดเมนู", "ingredientsUsed":["วัตถุดิบที่ 1", "วัตถุดิบที่ 2", "วัตถุดิบที่ 3", ...]}`

  const ai = "openrouter";
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

    const reply = `${content} เวลา ${new Date().toLocaleTimeString()}`;

    // optional latency simulation
    await new Promise((r) => setTimeout(r, 500));

    return res.json({ reply });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal error" });
  }
}