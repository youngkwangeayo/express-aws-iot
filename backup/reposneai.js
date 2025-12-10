// app.js or server.js
import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /ask
app.post("/ask", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // 원하는 모델
      messages: [
        { role: "user", content: message },
      ],
    });

    res.json({
      answer: response.choices[0].message.content,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OpenAI API 요청 실패" });
  }
});

app.listen(3000, () => console.log("Server started on port 3000"));



app.post("/image", async (req, res) => {
  const { prompt } = req.body;

  try {
    const result = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
    });

    res.json({
      imageUrl: result.data[0].url,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Image generation failed" });
  }
});
