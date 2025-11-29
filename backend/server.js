import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 生成故事
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
    console.log(err);
    res.status(500).json({ error: "故事生成失敗" });
  }
});

// 生成插圖（Google Image 2）
app.post("/api/image", async (req, res) => {
  try {
    const { sentence } = req.body;

    const model = genAI.getGenerativeModel({ model: "image-001" });

    const result = await model.generateImage({
      prompt: `兒童繪本風格、柔和水彩插圖：${sentence}`,
      size: "512x512"
    });

    const imageBase64 =
      result.images?.[0]?.base64Data || null;

    res.json({ image: imageBase64 });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "插圖生成失敗" });
  }
});

// Render 要求一定要用 PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
