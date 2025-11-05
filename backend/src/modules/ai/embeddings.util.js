// Lightweight embedding + similarity utilities with optional OpenAI integration.
// Falls back to simple token-frequency vectors if OPENAI_API_KEY not provided.

import crypto from "crypto";

const tokenize = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

export const buildBowVector = (text, extraTokens = []) => {
  const tokens = [...tokenize(text), ...extraTokens.map(String).map(t => t.toLowerCase())];
  const counts = new Map();
  for (const t of tokens) counts.set(t, (counts.get(t) || 0) + 1);
  return counts;
};

export const cosineSim = (aMap, bMap) => {
  if (!aMap || !bMap) return 0;
  let dot = 0;
  let aMag = 0;
  let bMag = 0;
  for (const [, v] of aMap) aMag += v * v;
  for (const [, v] of bMap) bMag += v * v;
  const keys = new Set([...aMap.keys(), ...bMap.keys()]);
  for (const k of keys) dot += (aMap.get(k) || 0) * (bMap.get(k) || 0);
  if (aMag === 0 || bMag === 0) return 0;
  return dot / (Math.sqrt(aMag) * Math.sqrt(bMag));
};

export const stableId = (input) =>
  crypto.createHash("sha1").update(String(input || "")).digest("hex");


