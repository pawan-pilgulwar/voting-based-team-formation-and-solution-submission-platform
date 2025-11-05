import { getEmbeddingVector, computeSimilarity } from "../modules/ai/embeddings.service.js";
import { User } from "../models/Users.model.js";

/**
 * Compute AI-based compatibility scores between users and a problem.
 * Uses semantic embeddings (OpenAI or BoW fallback).
 * 
 * @param {Array<string>} userIds - IDs of candidate users
 * @param {Object} problem - The problem document
 * @returns {Array<{ userId: ObjectId, score: number }>}
 */
export const getAIScoreForUsers = async (userIds, problem) => {
  const users = await User.find({ _id: { $in: userIds } });

  if (!users.length) return [];

  // ✅ Step 1: Build problem embedding vector
  const problemText = `${problem.title || ""} ${problem.description || ""}`;
  const problemVec = await getEmbeddingVector(problemText, [problem.category || ""]);

  // ✅ Step 2: Generate embedding and compute similarity for each user
  const userScores = [];
  for (const user of users) {
    const userText = [
      user.username || "",
      user.bio || "",
      user.skills?.join(" ") || "",
      user.interests?.join(" ") || "",
    ].join(" ");

    const userVec = await getEmbeddingVector(userText);
    const similarity = computeSimilarity(userVec, problemVec);

    userScores.push({
      userId: user._id,
      score: similarity,
    });
  }

  // ✅ Step 3: Sort users by similarity score (descending)
  userScores.sort((a, b) => b.score - a.score);

  return userScores;
};
