import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { CodeFile } from "../models/codefiles.model.js";
import axios from "axios";

// POST /api/v1/code/save
export const saveCode = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { teamId, filename, language, content, path = "", type = "file" } = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    throw new ApiError(400, "Invalid team id");
  }
  
  if (!filename && type === "file") {
    throw new ApiError(400, "File/folder name and path are required");
  }
  
  if (type === "file" && !language) {
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
    filename: filename || path,
    language: type === "file" ? language : "plain",
    content: type === "file" ? (content ?? "") : "",
    path,
    type,
  });

  // Emit socket event to notify team members of file creation
  try {
    const io = req.app.get("io");
    if (io) {
      const namespace = `/team/${teamId}`;
      // Get updated file tree
      const updatedFiles = await CodeFile.find({ team: teamId }).sort({ path: 1, filename: 1 }).lean();
      io.of(namespace).to(`dir:${teamId}`).emit("directory:update", { 
        files: updatedFiles, 
        fileId: created._id.toString(),
        action: "created",
        userId
      });
    }
  } catch (err) {
    console.error("Socket emission error:", err);
  }

  return res.status(201).json(new ApiResponse(201, created, "File created"));
});

// PATCH /api/v1/code/:fileId/rename
export const renameCodeFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const { newFilename, newPath = "" } = req.body || {};
  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    throw new ApiError(400, "Invalid file id");
  }
  if (!newFilename && newPath === undefined) {
    throw new ApiError(400, "Nothing to update");
  }
  try {
    const file = await CodeFile.findById(fileId);
    if (!file) throw new ApiError(404, "File or folder not found");

    const oldFilename = file.filename;
    const oldPath = file.path || "";
    const oldFull = oldPath ? `${oldPath}/${oldFilename}` : oldFilename;
    
    const updatedFilename = newFilename || oldFilename;
    const updatedPath = (newPath !== undefined) ? newPath : oldPath;
    const newFull = updatedPath ? `${updatedPath}/${updatedFilename}` : updatedFilename;

    file.filename = updatedFilename;
    file.path = updatedPath;
    await file.save();

    if (file.type === "folder") {
      const prefix = `${oldFull}`;
      const children = await CodeFile.find({ path: { $regex: `^${prefix}` } });
      for (const child of children) {
        const relative = child.path.slice(prefix.length);
        child.path = `${newFull}${relative}`;
        await child.save();
      }
    }

    // Emit socket event to notify team members of rename
    try {
      const io = req.app.get("io");
      const teamId = file.team;
      if (io) {
        const namespace = `/team/${teamId}`;
        // Get updated file tree
        const updatedFiles = await CodeFile.find({ team: file.team }).sort({ path: 1, filename: 1 }).lean();
        io.of(namespace).to(`dir:${teamId}`).emit("directory:update", { 
          files: updatedFiles, 
          fileId: fileId,
          action: "renamed",
          oldName: oldFilename,
          newName: updatedFilename
        });
      }
    } catch (err) {
      console.error("Socket emission error:", err);
    }

    return res.json(new ApiResponse(200, file, "Renamed successfully"));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, null, "Internal server error"));
  }
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
    const files = await CodeFile.find({ team: teamId }).sort({ path: 1, filename: 1 }).lean();

    const buildTree = (items, parentPath = "") => {
      const directChildren = items.filter((f) => f.path === parentPath);
      return directChildren.map((f) => ({
        _id: f._id,
        filename: f.filename,
        type: f.type,
        path: f.path,
        language: f.language,
        children: buildTree(items, `${parentPath}${parentPath ? "/" : ""}${f.filename}`),
      }));
    };

    const tree = buildTree(files, "");
    return res.json(new ApiResponse(200, tree, "Code file tree generated successfully"));

  } catch (error) {
    return res.status(500).json(new ApiResponse(500, null, "Internal server error"));
  }
});

// POST /api/v1/code/run
export const runCodeJudge0 = asyncHandler(async (req, res) => {
  const { languageId, sourceCode, stdin } = req.body;

  if (!languageId || !sourceCode) {
    throw new ApiError(400, "languageId and sourceCode are required");
  }

  try {
    const options = {
      method: "POST",
      url: `${process.env.JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
      headers: {
        "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
        "X-RapidAPI-Host": process.env.JUDGE0_HOST,
        "Content-Type": "application/json",
      },
      data: {
        language_id: languageId,
        source_code: sourceCode,
        stdin: stdin || "",
      },
    };

    const response = await axios.request(options);

    console.log(response.data)

    return res.status(200).json(new ApiResponse(200, response.data, "Execution complete"));
  } catch (error) {
    console.error("Judge0 Error:", error.response?.data || error.message);
    throw new ApiError(500, "Error running code with Judge0 API");
  }
});


// DELETE /api/v1/code/:fileId  (Delete a file or folder)
export const deleteCodeFile = asyncHandler(async (req, res) => {
  const { fileId, teamId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    throw new ApiError(400, "Invalid file id");
  }

  try {
    const file = await CodeFile.findById(fileId);
    if (!file) throw new ApiError(404, "File or folder not found");

    const teamId = file.team;
    // If it's a folder, delete all nested files inside
    let deleteCodeFiles = [];
    if (file.type === "folder") {
      const prefix = `${file.path}${file.path ? "/" : ""}${file.filename}`;
      const deleted = await CodeFile.deleteMany({
        $or: [{ _id: fileId }, { path: { $regex: `^${prefix}` } }],
      });
      deleteCodeFiles = { deletedCount: deleted.deletedCount || 0 };
    } else {
      // delete the file
      await file.deleteOne();
      deleteCodeFiles = { deletedCount: 1 };

      // After deleting a file, check if its parent folder (if any) is now empty and remove it
      const parentFull = file.path || "";
      if (parentFull) {
        const segments = parentFull.split("/");
        const folderFilename = segments.pop();
        const folderPath = segments.join("/");
        const parentFolder = await CodeFile.findOne({ type: "folder", filename: folderFilename, path: folderPath });
        if (parentFolder) {
          // Count any remaining items whose path equals the folder full path or starts with folderFull/
          const childCount = await CodeFile.countDocuments({ path: { $regex: `^${parentFull}(/|$)` } });
          if (childCount === 0) {
            try {
              await parentFolder.deleteOne();
              // reflect removal in response
              deleteCodeFiles.parentFolderDeleted = true;
            } catch (err) {
              console.error("Failed to delete empty parent folder:", err);
            }
          }
        }
      }
    }

    // Emit socket event to notify team members of deletion
    try {
      const io = req.app.get("io");
      if (io) {
        const namespace = `/team/${teamId}`;
        // Get updated file tree
        const updatedFiles = await CodeFile.find({ team: teamId }).sort({ path: 1, filename: 1 }).lean();
        io.of(namespace).to(`dir:${teamId}`).emit("directory:update", { 
          files: updatedFiles, 
          fileId: fileId,
          action: "deleted",
          deletedName: file.filename
        });
      }
    } catch (err) {
      console.error("Socket emission error:", err);
    }

    return res.json(new ApiResponse(200, deleteCodeFiles, "File or folder deleted successfully"));

  } catch (error) {
    return res.status(500).json(new ApiResponse(500, null, "Internal server error"));
  }

});


