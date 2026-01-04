// src/services/aiPipeline.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import FirecrawlApp from "@mendable/firecrawl-js";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

// Initialize Clients
const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// 1. SCRAPE & SUMMARIZE
export async function scrapeAndSummarize(url: string) {
  // A. Scrape
  const scrapeResult = await firecrawl.scrape(url, { formats: ["markdown"] });
  if (!scrapeResult || !scrapeResult.markdown) {
    throw new Error(`Firecrawl failed to scrape URL: ${url}`);
  }

  const content = scrapeResult.markdown || "";
  const title = scrapeResult.metadata?.title || "Untitled Link";

  // B. Summarize
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a bookmark assistant. Summarize the following text into 2 concise sentences.",
      },
      { role: "user", content: content.substring(0, 15000) }, // Limit context window
    ],
    model: "llama-3.3-70b-versatile",
  });

  const summary =
    chatCompletion.choices[0]?.message?.content || "No summary available";

  return { title, content, summary };
}

// 2. GENERATE EMBEDDING
export async function getEmbedding(text: string) {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values; // Returns array of 768 numbers
}
