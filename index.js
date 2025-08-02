
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const { Configuration, OpenAIApi } = require("openai");

require("dotenv").config();
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const dataBuffer = fs.readFileSync(file.path);
    const data = await pdfParse(dataBuffer);
    res.json({ success: true, text: data.text });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/gpt", async (req, res) => {
  const { prompt } = req.body;
  try {
    const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
