import { Problem } from "../models/problems.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * 🧩 Create a new problem
 */
export const createProblem = asyncHandler(async (req, res) => {
  const { title, description, tags, difficulty, deadline } = req.body;

  try {
    if (!title || !description) {
      throw new ApiError(400, "Title and description are required");
    }
  
    const newProblem = await Problem.create({
      title,
      description,
      tags,
      difficulty,
      deadline,
      postedBy: req.user._id, // from auth middleware
    });

    if (!newProblem) {
      throw new ApiError(500, "Failed to create problem");
    }

    const enrichedProblems = await Promise.all(
      [newProblem].map(async (p) => {
      return {
        ...p.toObject(),
        hasVoted: req.user ? await p.hasVoted(req.user._id) : false,
        voteCount: p.getVoteCount(),
      };
    })
  );
  
    return res
      .status(201)
      .json(new ApiResponse(201, enrichedProblems, "Problem created successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to create problem");
  }
});

/**
 * 📚 Get all problems (with filters)
 */
export const getAllProblems = asyncHandler(async (req, res) => {
  const { difficulty, status, tag, search } = req.query;

  try {
    const filter = {};
    if (difficulty) filter.difficulty = difficulty;
    if (status) filter.status = status;
    if (tag) filter.tags = tag;

    if (search) {
      filter.$text = { $search: search };
    }

    const problems = await Problem.find(filter)
    .populate("postedBy", "username email")
    .populate("votes")
    .sort({ createdAt: -1 });
    
  const enrichedProblems = await Promise.all(
    problems.map(async (p) => {
      return {
        ...p.toObject(),
        hasVoted: req.user ? await p.hasVoted(req.user._id) : false,
        voteCount: p.getVoteCount(),
      };
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, enrichedProblems, 
    "Problems fetched successfully", ));
  } catch (error) {
    throw new ApiError(500, "Failed to fetch problems");
  }
});

/**
 * 🔍 Get single problem by ID
 */
export const getProblemById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const problem = await Problem.findById(id)
    .populate("postedBy", "username email")
    .populate("selectedTeams", "name members")
    .populate("votes", "user");

  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  const enrichedProblem = {
    ...problem.toObject(),
    hasVoted: req.user ? await problem.hasVoted(req.user._id) : false,
    voteCount: problem.getVoteCount(),
  };

  return res
    .status(200)
    .json(new ApiResponse(200, enrichedProblem, "Problem fetched successfully"));
});

/**
 * ✏️ Update problem
 */
export const updateProblem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const problem = await Problem.findById(id);
  if (!problem) throw new ApiError(404, "Problem not found");

  // Ensure only the creator can update
  if (problem.postedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to edit this problem");
  }

  Object.assign(problem, updates);
  await problem.save();

  const enrichedProblem = {
    ...problem.toObject(),
    hasVoted: req.user ? await problem.hasVoted(req.user._id) : false,
    voteCount: problem.getVoteCount(),
  };

  return res
    .status(200)
    .json(new ApiResponse(200, enrichedProblem, "Problem updated successfully"));
});

/**
 * 🗑️ Delete problem
 */
export const deleteProblem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const problem = await Problem.findById(id);
  if (!problem) throw new ApiError(404, "Problem not found");

  if (problem.postedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to delete this problem");
  }

  await problem.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Problem deleted successfully"));
});
