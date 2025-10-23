import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Team } from "../models/teams.model.js";
import { User } from "../models/Users.model.js";
import { buildBowVector, cosineSim } from "../modules/ai/embeddings.util.js";

// GET /api/v1/mentors/matches/:id
export const mentorMatches = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const mentor = await User.findById(id).lean();
  if (!mentor) throw new ApiError(404, "Mentor not found");
  const mentorSkills = mentor.skills || mentor.expertise || [];
  const mentorVec = buildBowVector(mentor.bio || "", mentorSkills);
  const teams = await Team.find({ status: { $in: ["active", "submitted"] } }).populate("problem").lean();
  const scored = teams.map(t => {
    const summary = `${t.name} ${t.problem?.title || ""} ${t.problem?.description || ""}`;
    const tVec = buildBowVector(summary, t.problem?.tags || []);
    return { team: t, score: cosineSim(mentorVec, tVec) };
  }).sort((a,b) => b.score - a.score).slice(0, 10);
  return res.json(new ApiResponse(200, { teams: scored }));
});

// POST /api/v1/mentors/join-team/:teamId
export const joinTeam = asyncHandler(async (req, res) => {
  const mentorId = req.user?._id;
  if (req.user?.role !== "mentor" && req.user?.role !== "admin") {
    throw new ApiError(403, "Only mentors or admins can join teams as mentor");
  }
  const { teamId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(teamId)) throw new ApiError(400, "Invalid team id");
  const updated = await Team.findByIdAndUpdate(
    teamId,
    { $set: { mentor: mentorId } },
    { new: true }
  );
  return res.json(new ApiResponse(200, updated, "Mentor assigned to team"));
});


