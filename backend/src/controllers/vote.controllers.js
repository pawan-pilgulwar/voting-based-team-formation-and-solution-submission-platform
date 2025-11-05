import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Vote } from "../models/votes.model.js";
import { Problem } from "../models/problems.model.js";
import { Team } from "../models/teams.model.js";
import { User } from "../models/Users.model.js";
import { getAIScoreForUsers } from "../services/aiScore.service.js";

// POST /api/v1/votes/:problemId
export const castVote = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { problemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(problemId)) {
    throw new ApiError(400, "Invalid problem id");
  }

  const problem = await Problem.findById(problemId);
  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  // ✅ Check if max votes reached
  if (problem.votes.length >= 6) {
    throw new ApiError(400, "Voting is closed for this problem");
  }

  try {
    const vote = await Vote.create({ problem: problem._id, votedBy: userId });

    // Link vote to problem (ignore if already present)
    await Problem.updateOne({ _id: problem._id }, { $addToSet: { votes: vote._id } });

    // Check total votes
    const totalVotes = await Vote.countDocuments({ problem: problem._id });

    // Auto team formation at 6 votes if no team exists for this problem yet
    const existingTeam = await Team.findOne({ problem: problem._id });
    if (totalVotes === 6 && !existingTeam) {
      const voters = await Vote.find({ problem: problem._id })
        .sort({ createdAt: 1 })
        .limit(6)
        .lean();

      const userIds = voters.map(v => v.votedBy._id);

      // Use AI scoring logic to select leader & best team composition
      const aiRanked = await getAIScoreForUsers(userIds, problem);

      const leaderUserId = aiRanked[0]?.userId;
      const memberUserIds = aiRanked.slice(1).map(u => u.userId);

      const teamNameBase = problem.title?.slice(0, 30) || "Team";
      const newTeam = await Team.create({
        name: `${teamNameBase} Team`,
        problem: problem._id,
        members: [
          { user: leaderUserId, role: "leader" },
          ...memberUserIds.map(id => ({ user: id, role: "member" }))
        ],
        chatRoomId: undefined, // set after _id is known if needed by sockets
        status: "active",
      });

      // Set chatRoomId to stable namespace string
      if (!newTeam.chatRoomId) {
        newTeam.chatRoomId = `team:${newTeam._id.toString()}`;
        await newTeam.save();
      }

      // Attach team to problem
      await Problem.updateOne(
        { _id: problem._id },
        { $addToSet: { selectedTeams: newTeam._id }, $set: { status: "in-progress" } }
      );

      // Update users (students/mentors share base model) with team reference where applicable
      await User.updateMany(
        { _id: { $in: [leaderUserId, ...memberUserIds] }, role: "student" },
        { $addToSet: { teams: newTeam._id } }
      );
    }

    return res.status(201).json(new ApiResponse(201, { voted: true }, "Vote recorded"));
  } catch (err) {
    // Handle duplicate vote (unique index error)
    if (err && err.code === 11000) {
      throw new ApiError(409, "You have already voted for this problem");
    }
    throw new ApiError(500, "Failed to cast vote");
  }
});

// GET /api/v1/votes/:problemId/count
export const getVoteCount = asyncHandler(async (req, res) => {
  const { problemId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(problemId)) {
    throw new ApiError(400, "Invalid problem id");
  }
  const count = await Vote.countDocuments({ problem: problemId });
  return res.json(new ApiResponse(200, { count }));
});


