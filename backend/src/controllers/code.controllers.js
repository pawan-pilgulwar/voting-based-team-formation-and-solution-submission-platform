import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { CodeFile } from "../models/codefiles.model.js";

// POST /api/v1/code/save
export const saveCode = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { teamId, filename, language, content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    throw new ApiError(400, "Invalid team id");
  }
  if (!filename || !language) {
    throw new ApiError(400, "filename and language are required");
  }

  const existing = await CodeFile.findOne({ team: teamId, filename });
  if (existing) {
    existing.content = content ?? existing.content;
    existing.language = language ?? existing.language;
    existing.author = userId;
    await existing.save();
    return res.json(new ApiResponse(200, existing, "File updated"));
  }

  const created = await CodeFile.create({ team: teamId, author: userId, filename, language, content: content ?? "" });
  return res.status(201).json(new ApiResponse(201, created, "File created"));
});

// GET /api/v1/code/team/:teamId
export const getTeamCodeFiles = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    throw new ApiError(400, "Invalid team id");
  }
  const files = await CodeFile.find({ team: teamId }).sort({ updatedAt: -1 });
  return res.json(new ApiResponse(200, files));
});


