import { Problem } from "../models/problems.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * 🧩 Create a new problem
 */
export const createProblem = asyncHandler(async (req, res) => {
  const { title, description, tags, difficulty, deadline } = req.body;

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

  return res
    .status(201)
    .json(new ApiResponse(201, newProblem, "Problem created successfully"));
});

/**
 * 📚 Get all problems (with filters)
 */
export const getAllProblems = asyncHandler(async (req, res) => {
  const { difficulty, status, tag, search } = req.query;

  const filter = {};
  if (difficulty) filter.difficulty = difficulty;
  if (status) filter.status = status;
  if (tag) filter.tags = tag;

  if (search) {
    filter.$text = { $search: search };
  }

  const problems = await Problem.find(filter)
    .populate("postedBy", "username email")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, problems, "Problems fetched successfully"));
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

  return res
    .status(200)
    .json(new ApiResponse(200, problem, "Problem fetched successfully"));
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

  return res
    .status(200)
    .json(new ApiResponse(200, problem, "Problem updated successfully"));
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
