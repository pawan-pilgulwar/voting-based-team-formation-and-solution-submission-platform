import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/Users.model.js";
import { Problem } from "../models/problems.model.js";
import { Team } from "../models/teams.model.js";
import {
  getEmbeddingVector,
  computeSimilarity,
} from "../modules/ai/embeddings.service.js";

export const recommendForUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).lean();
    if (!user) throw new ApiError(404, "User not found");

    const userSkills = user.skills || [];
    const userVec = await getEmbeddingVector(user.bio || "", userSkills);

    const problems = await Problem.find({
      status: { $in: ["open", "in-progress"] },
    }).lean();
    const scoredProblems = await Promise.all(
      problems.map(async (p) => {
        const pVec = await getEmbeddingVector(
          `${p.title} ${p.description}`,
          p.tags || []
        );
        const score = computeSimilarity(userVec, pVec);
        return { problem: p, score };
      })
    );
    scoredProblems.sort((a, b) => b.score - a.score);
    return res.json(
      new ApiResponse(200, { problems: scoredProblems.slice(0, 10) })
    );
  } catch (error) {
    console.error("Error recommending problems:", error);
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
});

export const recommendForMentor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const mentor = await User.findById(id).lean();
  if (!mentor) throw new ApiError(404, "Mentor not found");

  const mentorSkills = mentor.skills || mentor.expertise || [];
  const mentorVec = await getEmbeddingVector(mentor.bio || "", mentorSkills);

  const teams = await Team.find({ status: { $in: ["active", "submitted"] } })
    .populate("problem")
    .lean();

  const scoredTeams = await Promise.all(
    teams.map(async (t) => {
      const summary = `${t.name} ${t.problem?.title || ""} ${t.problem?.description || ""}`;
      const tags = t.problem?.tags || [];
      const tVec = await getEmbeddingVector(summary, tags);
      const score = computeSimilarity(mentorVec, tVec);
      return { team: t, score };
    })
  );

  scoredTeams.sort((a, b) => b.score - a.score);
  return res.json(new ApiResponse(200, { teams: scoredTeams.slice(0, 10) }));
});
