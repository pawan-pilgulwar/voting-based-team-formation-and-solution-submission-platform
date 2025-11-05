import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Solution } from "../models/solutions.model.js";
import { Team } from "../models/teams.model.js";
import { Problem } from "../models/problemSs.model.js";

// POST /api/v1/solutions/submit
export const submitSolution = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { teamId, problemId, files = [], attachments = [] } = req.body;
  if (
    !mongoose.Types.ObjectId.isValid(teamId) ||
    !mongoose.Types.ObjectId.isValid(problemId)
  ) {
    throw new ApiError(400, "Invalid team/problem id");
  }
  const team = await Team.findById(teamId).lean();
  if (!team) throw new ApiError(404, "Team not found");
  const leader = team.members.find(
    (m) => String(m.user) === String(userId) && m.role === "leader"
  );
  if (!leader) throw new ApiError(403, "Only team leader can submit solution");

  // Validate or create code files if they exist in the request
  const fileIds = [];
  for (const file of files) {
    const existing = await CodeFile.findOne({
      team: teamId,
      path: file.path,
      name: file.name,
    });
    if (existing) {
      // Update existing file content
      existing.content = file.content;
      existing.language = file.language;
      await existing.save();
      fileIds.push(existing._id);
    } else {
      // Create new file
      const created = await CodeFile.create({
        team: teamId,
        author: userId,
        name: file.name,
        path: file.path,
        type: file.type || "file",
        language: file.language || null,
        content: file.content || "",
      });
      fileIds.push(created._id);
    }
  }

  const created = await Solution.create({
    team: teamId,
    problem: problemId,
    submittedBy: userId,
    files: fileIds,
    attachments,
    status: "submitted",
  });
  await Team.updateOne({ _id: teamId }, { $set: { status: "submitted" } });
  await Problem.updateOne(
    { _id: problemId },
    { $set: { status: "submitted" } }
  );
  return res
    .status(201)
    .json(new ApiResponse(201, created, "Solution submitted"));
});

// POST /api/v1/solutions/review
export const reviewSolution = asyncHandler(async (req, res) => {
  if (req.user?.role !== "organization" && req.user?.role !== "admin") {
    throw new ApiError(403, "Only organization or admin can review solutions");
  }
  const { solutionId, status, score, remarks } = req.body;
  if (!mongoose.Types.ObjectId.isValid(solutionId))
    throw new ApiError(400, "Invalid solution id");
  if (!["under-review", "approved", "rejected"].includes(status))
    throw new ApiError(400, "Invalid status");
  const update = { status };
  if (score !== undefined || remarks !== undefined) {
    update.evaluation = { score, remarks };
  }
  const updated = await Solution.findByIdAndUpdate(
    solutionId,
    { $set: update },
    { new: true }
  );
  if (!updated) throw new ApiError(404, "Solution not found");
    // If approved or rejected, update team and problem status
  if (status === "approved" || status === "rejected") {
    await Team.updateOne({ _id: updated.team }, { $set: { status: "reviewed" } });
    await Problem.updateOne(
      { _id: updated.problem },
      { $set: { status: "reviewed" } }
    );
  }
  return res.json(new ApiResponse(200, updated, "Solution reviewed"));
});


// POST /api/v1/solutions/:id/feedback
export const addFeedback = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { solutionId } = req.params;
  const { comment } = req.body;

  if (req.user?.role !== "mentor") {
    throw new ApiError(403, "Only mentors can add feedback");
  }

  if (!mongoose.Types.ObjectId.isValid(solutionId)) {
    throw new ApiError(400, "Invalid solution id");
  }

  const feedback = {
    mentor: userId,
    comment,
    date: new Date(),
  };

  const updated = await Solution.findByIdAndUpdate(
    solutionId,
    { $push: { feedback } },
    { new: true }
  );

  if (!updated) throw new ApiError(404, "Solution not found");

  return res.json(new ApiResponse(200, updated, "Feedback added"));
});



// GET /api/v1/solutions/:solutionId
export const getSolutionById = asyncHandler(async (req, res) => {
  const { solutionId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(solutionId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid solution id"));
  }
  try {
    const solution = await Solution.findById(solutionId)
        .populate("team problem submittedBy files feedback.mentor", "-password")
        .lean();
    if (!solution) throw new ApiError(404, "Solution not found");
    return res.json(new ApiResponse(200, solution, "Solution retrieved"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error"));
  }
});

// GET /api/v1/solutions/team/:teamId
export const getSolutionsByTeamId = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid team id"));
  }
  try {
    const solutions = await Solution.find({ team: teamId })
        .populate("problem files feedback.mentor")
        .lean();
    return res.json(new ApiResponse(200, solutions, "Solutions retrieved"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error"));
  }
});

// GET /api/v1/solutions/problem/:problemId
export const getSolutionsByProblemId = asyncHandler(async (req, res) => {
  const { problemId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(problemId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid problem id"));
  }
  try {
    const solutions = await Solution.find({ problem: problemId })
        .populate("team submittedBy files")
        .lean();
    return res.json(new ApiResponse(200, solutions, "Solutions retrieved"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error"));
  }
});
