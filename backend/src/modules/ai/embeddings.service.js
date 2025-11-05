// /modules/ai/embeddings.service.js
import OpenAI from "openai";
import { buildBowVector, cosineSim, stableId } from "./embeddings.util.js";

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Cache to avoid recomputing embeddings repeatedly
const embeddingCache = new Map();

/**
 * Get an embedding vector for a given text
 * Uses OpenAI if API key exists, otherwise falls back to buildBowVector
 */
export async function getEmbeddingVector(text, extraTokens = []) {
  if (!text && !extraTokens.length) return null;

  const key = stableId(text + JSON.stringify(extraTokens));
  if (embeddingCache.has(key)) return embeddingCache.get(key);

  let vector;
  if (openai) {
    // ✅ Use OpenAI embedding model
    try {
      const input = `${text} ${extraTokens.join(" ")}`;
      const resp = await openai.embeddings.create({
        model: "text-embedding-3-small", // cheap & fast
        input,
      });
      vector = resp.data[0].embedding;
    } catch (err) {
      console.error("OpenAI embedding error:", err.message);
      // fallback
      vector = buildBowVector(text, extraTokens);
    }
  } else {
    // 🧠 Fallback: local BoW vector
    vector = buildBowVector(text, extraTokens);
  }

  embeddingCache.set(key, vector);
  return vector;
}

/**
 * Compute similarity between two vectors.
 * Supports both float arrays (OpenAI embeddings) and BoW maps (local).
 */
export function computeSimilarity(aVec, bVec) {
  if (!aVec || !bVec) return 0;

  if (Array.isArray(aVec) && Array.isArray(bVec)) {
    // Both are numeric embeddings
    let dot = 0, aMag = 0, bMag = 0;
    for (let i = 0; i < aVec.length; i++) {
      dot += aVec[i] * bVec[i];
      aMag += aVec[i] ** 2;
      bMag += bVec[i] ** 2;
    }
    return dot / (Math.sqrt(aMag) * Math.sqrt(bMag));
  }

  // fallback for BoW maps
  return cosineSim(aVec, bVec);
}
