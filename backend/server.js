import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/story", async (req, res) => {
  try {
    const { answers, theme } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
根據以下孩子的回答，生成一個 400–600 字的兒童繪本故事。
主題：${theme}
孩子回答：${JSON.stringify(answers)}
風格：柔和溫暖。
`;

    const result = await model.generateContent(prompt);
    res.json({ story: result.response.text() });
  } catch (err) {
    res.status(500).json({ error: "故事生成失敗" });
  }
});

app.post("/api/image", async (req, res) => {
  try {
    const { sentence } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    const img = await model.generateContent({
      prompt: `兒童繪本柔和水彩風格：${sentence}`,
      size: "512x512",
    });

    res.json({ image: img.response.candidates[0].content.parts[0].inlineData.data });
  } catch (err) {
    res.status(500).json({ error: "插圖生成失敗" });
  }
});

app.listen(3000, () => console.log("Backend running"));
