import { Team } from "../models/teams.model.js";
import { Vote } from "../models/votes.model.js";
import { User } from "../models/Users.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * Create Team (AI-assisted formation)
 * Uses AI logic to suggest members based on skills, interests, or votes.
 */


export const createTeam = asyncHandler(async (req, res) => {
  const { problemId, name, mentorId } = req.body;
  const leaderId = req.user._id;

  if (!problemId || !name) {
    throw new ApiError(400, "Problem ID and Team name are required");
  }

  // Example: AI-assisted member suggestion (stub)
  // In real case, you’d call an AI API or use a trained model to pick members.
  const suggestedMembers = await User.aggregate([
    { $match: { _id: { $ne: leaderId } } },
    { $sample: { size: 4 } }, // randomly pick 4 members (AI can refine this)
  ]);

  const members = [
    { user: leaderId, role: "leader" },
    ...suggestedMembers.map((u) => ({ user: u._id, role: "member" })),
  ];

  const team = await Team.create({
    name,
    problem: problemId,
    members,
    mentor: mentorId || null,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, team, "Team created successfully (AI-assisted)"));
});



/**
 * 🗳️ 2. Form Team Based on Voting
 * Forms team automatically by grouping users who voted for the same problem.
 */



export const formTeamByVoting = asyncHandler(async (req, res) => {
  const { problemId } = req.params;

  if (!problemId) throw new ApiError(400, "Problem ID is required");

  // Fetch all votes for this problem
  const votes = await Vote.find({ problem: problemId }).populate("votedBy");

  if (votes.length < 2) {
    throw new ApiError(400, "Not enough votes to form a team");
  }

  const users = votes.map((v) => v.votedBy._id);
  const leader = users[0];

  const members = users.map((userId, index) => ({
    user: userId,
    role: index === 0 ? "leader" : "member",
  }));

  // Create team
  const team = await Team.create({
    name: `Team_${problemId}_${Date.now()}`,
    problem: problemId,
    members,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, team, "Team formed successfully via voting"));
});



/**
 * 📋 3. Get All Teams (optionally filter by problem or mentor)
 */
export const getAllTeams = asyncHandler(async (req, res) => {
  const { problemId, mentorId } = req.query;

  const filter = {};
  if (problemId) filter.problem = problemId;
  if (mentorId) filter.mentor = mentorId;

  const teams = await Team.find(filter)
    .populate("problem")
    .populate("members.user")
    .populate("mentor");

  return res
    .status(200)
    .json(new ApiResponse(200, teams, "Teams fetched successfully"));
});

/**
 * 🔍 4. Get a Team by ID
 */
export const getTeamById = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  const team = await Team.findById(teamId)
    .populate("problem")
    .populate("members.user")
    .populate("mentor");

  if (!team) throw new ApiError(404, "Team not found");

  return res.status(200).json(new ApiResponse(200, team, "Team details fetched"));
});

/**
 * ⚙️ 5. Update Team Progress
 */
export const updateTeamProgress = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const { currentPhase, percentage } = req.body;

  const team = await Team.findById(teamId);
  if (!team) throw new ApiError(404, "Team not found");

  team.progress.currentPhase = currentPhase || team.progress.currentPhase;
  team.progress.percentage = percentage ?? team.progress.percentage;

  await team.save();

  return res
    .status(200)
    .json(new ApiResponse(200, team, "Team progress updated successfully"));
});
