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

  if (!filename || !path) {
    throw new ApiError(400, "File/folder name and path are required");
  }

  if (!language) {
    throw new ApiError(400, "language is required");
  }


  const existing = await CodeFile.findOne({ team: teamId, path, filename });
  if (existing) {
    // Update content (only if file)
    if (existing.type === "file") {
      existing.content = content ?? existing.content;
      existing.language = language ?? existing.language;
      existing.author = userId;
      await existing.save();
      return res.json(new ApiResponse(200, existing, "File updated successfully"));
    } else {
      return res.json(new ApiResponse(200, existing, "Folder already exists"));
    }
  }

  const created = await CodeFile.create({ 
    team: teamId, 
    author: userId, 
    filename, 
    language, 
    content: content ?? "" 
  });
  return res.status(201).json(new ApiResponse(201, created, "File created"));
});

// GET /api/v1/code/team/:teamId
export const getTeamCodeFiles = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    throw new ApiError(400, "Invalid team id");
  }
  const files = await CodeFile.find({ team: teamId }).sort({ path: 1, filename: 1 }).lean();
  return res.json(new ApiResponse(200, files, "code files fetched successfully"));
});

// GET /api/v1/code/team/:teamId/tree  (Return directory structure)
export const getTeamCodeTree = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    throw new ApiError(400, "Invalid team id");
  }

  try {
    const files = await CodeFile.find({ team: teamId }).sort({ path: 1, name: 1 }).lean();
  
    // Convert flat list → nested tree
    const buildTree = (items, parentPath = "") => {
      return items
        .filter((f) => f.path === parentPath)
        .map((f) => ({
          ...f,
          children: buildTree(items, `${f.path}/${f.name}`),
        }));
    };
  
    const tree = buildTree(files, "");
    return res.json(new ApiResponse(200, tree, "Code file tree generated successfully"));

  } catch (error) {
    return res.status(500).json(new ApiResponse(500, null, "Internal server error"));
  }
});


// DELETE /api/v1/code/:fileId  (Delete a file or folder)
export const deleteCodeFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    throw new ApiError(400, "Invalid file id");
  }

  try {
    const file = await CodeFile.findById(fileId);
    if (!file) throw new ApiError(404, "File or folder not found");
  
    // If it's a folder, delete all nested files inside
    let deleteCodeFiles = [];
    if (file.type === "folder") {
      const prefix = `${file.path}/${file.name}`;
      const deleted = await CodeFile.deleteMany({
        $or: [{ _id: fileId }, { path: { $regex: `^${prefix}` } }],
      });
      deleteCodeFiles = [...deleted]
    } else {
      const deleted = await file.deleteOne();
      deleteCodeFiles = [...deleteCodeFiles, deleted];
    }

    return res.json(new ApiResponse(200, deleteCodeFiles, "File or folder deleted successfully"));

  } catch (error) {
    return res.status(500).json(new ApiResponse(500, null, "Internal server error"));
  }

});


