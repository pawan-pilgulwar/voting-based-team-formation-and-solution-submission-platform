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

export const recommendForOrg = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const org = await User.findById(id).lean();
    if (!org || org.role !== "organization") throw new ApiError(404, "Organization not found");

    const orgProblems = await Problem.find({ postedBy: id, status: { $in: ["open", "in-progress"] } }).lean();
    const problemMap = new Map(orgProblems.map((p) => [String(p._id), p]));

    const teams = await Team.find({ problem: { $in: orgProblems.map((p) => p._id) } })
      .populate("problem")
      .lean();

    const orgVec = await getEmbeddingVector(org.bio || "", org.skills || []);

    const scored = await Promise.all(
      teams.map(async (t) => {
        const p = t.problem || problemMap.get(String(t.problem));
        const summary = `${t.name} ${p?.title || ""} ${p?.description || ""}`;
        const tags = p?.tags || [];
        const tVec = await getEmbeddingVector(summary, tags);
        const score = computeSimilarity(orgVec, tVec);
        return { team: t, problem: p, score };
      })
    );

    scored.sort((a, b) => b.score - a.score);
    return res.json(new ApiResponse(200, { teams: scored.slice(0, 10) }));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
});
