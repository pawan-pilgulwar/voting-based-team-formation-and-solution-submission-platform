import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Vote } from "../models/votes.model.js";
import { Problem } from "../models/problemStatements.model.js";
import { Team } from "../models/teams.model.js";
import { User } from "../models/Users.model.js";

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

  try {
    const vote = await Vote.create({ problem: problem._id, votedBy: userId });

    // Link vote to problem (ignore if already present)
    await Problem.updateOne({ _id: problem._id }, { $addToSet: { votes: vote._id } });

    // Check total votes
    const totalVotes = await Vote.countDocuments({ problem: problem._id });

    // Auto team formation at 6 votes if no team exists for this problem yet
    const existingTeamCount = await Team.countDocuments({ problem: problem._id });
    if (totalVotes === 6 && existingTeamCount === 0) {
      const voters = await Vote.find({ problem: problem._id })
        .sort({ createdAt: 1 })
        .limit(6)
        .lean();

      const leaderUserId = voters[0]?.votedBy;
      const memberUserIds = voters.slice(1).map(v => v.votedBy);

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


