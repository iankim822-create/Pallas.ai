
"use client";
import { useState } from "react";

export default function UploadPDF() {
  const [file, setFile] = useState(null);
  const [pdfText, setPdfText] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isUploaded, setIsUploaded] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a PDF.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await uploadRes.json();
      console.log("UPLOAD RESPONSE:", data);

      if (data.success && data.text) {
        setPdfText(data.text);
        setIsUploaded(true);
      } else {
        alert("Upload failed. Text may be empty.");
      }
    } catch (err) {
      alert("Something went wrong during upload.");
    }
  };

  const handleAsk = async () => {
    if (!userPrompt) {
      alert("Please enter a question.");
      return;
    }

    try {
      const gptRes = await fetch("/api/gpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Here is a document:\n\n${pdfText}\n\nNow answer this: ${userPrompt}`,
        }),
      });

      const { reply } = await gptRes.json();
      setResponse(reply);
    } catch (err) {
      alert("Error asking GPT.");
    }
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>📄 Chat With Your PDF</h1>
      <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} style={{ marginLeft: "1rem" }}>Upload PDF</button>

      {isUploaded && (
        <>
          <div style={{ marginTop: "2rem" }}>
            <h3>🧠 Ask GPT a Question About the Document:</h3>
            <textarea
              rows={4}
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="e.g., What are the main arguments in this text?"
              style={{ width: "100%", padding: "1rem", fontSize: "1rem" }}
            />
            <button onClick={handleAsk} style={{ marginTop: "1rem" }}>Ask GPT</button>
          </div>

          {response && (
            <div style={{ marginTop: "2rem", whiteSpace: "pre-wrap" }}>
              <h2>🤖 GPT's Response:</h2>
              <p>{response}</p>
            </div>
          )}
        </>
      )}
    </main>
  );
}
