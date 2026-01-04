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
  console.log(`🔍 [Firecrawl] Starting scrape for: ${url}`);

  try {
    // Firecrawl.scrape() returns a Document object directly
    const scrapeResult = await firecrawl.scrape(url, {
      formats: ["markdown"],
    });

    console.log(`📡 [Firecrawl] Scraping completed for: ${url}`);

    // FIX 1: Access the markdown content from the Document object
    let rawContent = scrapeResult.markdown || "";
    const title = scrapeResult.metadata?.title || "Untitled Link";

    console.log(`📄 [Firecrawl] Title: "${title}"`);
    console.log(
      `📄 [Firecrawl] Content length: ${rawContent.length} characters`
    );

    // FIX 2: Handle very short or empty content
    if (!rawContent || rawContent.length < 100) {
      console.warn(
        "⚠️ [Firecrawl] Content is very short or empty. Using title as fallback."
      );
      rawContent = `This page is titled: "${title}". No detailed content could be extracted from the URL.`;
    }

    // FIX 3: Truncate for Groq's context window (keep more content than before)
    const truncatedContent = rawContent.substring(0, 6000);

    console.log("🧠 [Groq] Sending to AI for summarization...");

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a bookmark assistant. Your task is to write a concise 2-sentence description of web page content. CRITICAL RULES: 1) Start directly with the content - NO meta-commentary like 'Here is a summary' or 'This text describes'. 2) Be factual and specific. 3) Output ONLY the description, nothing else.",
          },
          {
            role: "user",
            content: truncatedContent,
          },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.3, // Lower for more deterministic, factual output
      });

      const summary =
        chatCompletion.choices[0]?.message?.content?.trim() ||
        "No summary available.";

      console.log(
        `✅ [Groq] Summary generated (${summary.length} chars): "${summary.substring(0, 100)}..."`
      );

      return {
        title,
        content: rawContent,
        summary,
      };
    } catch (groqError: any) {
      console.error("❌ [Groq] AI summarization failed:", groqError.message);
      // Return fallback summary instead of throwing
      return {
        title,
        content: rawContent,
        summary: `Information about: ${title}`,
      };
    }
  } catch (firecrawlError: any) {
    console.error(
      "❌ [Firecrawl] Scraping completely failed:",
      firecrawlError.message
    );
    throw firecrawlError; // Re-throw to be caught by controller
  }
}

// 2. GENERATE EMBEDDING
export async function getEmbedding(text: string) {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values; // Returns array of 768 numbers
}
