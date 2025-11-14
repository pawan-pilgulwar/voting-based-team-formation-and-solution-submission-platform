import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ChatMessage } from "../models/chat.model.js";
import { Team } from "../models/teams.model.js";

// POST /api/v1/chat/team/:teamId
export const postTeamMessage = asyncHandler(async (req, res) => {
try {
    const senderId = req.user?._id;
    const { teamId } = req.params;
    const { text, attachments } = req.body;
    if (!mongoose.Types.ObjectId.isValid(teamId)) throw new ApiError(400, "Invalid team id");
  
    const msg = await ChatMessage.create({ team: teamId, sender: senderId, text: text || "", attachments: attachments || [], role: req.user.role });
    // Emit to Socket.io namespace /team/:teamId
    const io = req.app.get("io");
    if (io) {
      const ns = `/team/${teamId}`;
      io.of(ns).to(teamId.toString()).emit("message", {
        _id: msg._id,
        team: msg.team,
        sender: msg.sender,
        text: msg.text,
        attachments: msg.attachments,
        role: msg.role,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
      });
    }
    return res.status(201).json(new ApiResponse(201, msg));
} catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
}
});

// GET /api/v1/chat/team/:teamId
export const getTeamMessages = asyncHandler(async (req, res) => {
    try {
        const { teamId } = req.params;
        const userId = req.user?._id;
        if (!mongoose.Types.ObjectId.isValid(teamId)) throw new ApiError(400, "Invalid team id");
        const messages = await ChatMessage.find({ team: teamId, deletedFor: { $ne: userId } }).sort({ createdAt: 1 }).lean();
        return res.json(new ApiResponse(200, messages));
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Internal Server Error"));
    }
});

// DELETE (soft) /api/v1/chat/message/:messageId  - mark hidden for this user (only if sender)
export const deleteMessage = asyncHandler(async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user?._id;
        if (!mongoose.Types.ObjectId.isValid(messageId)) throw new ApiError(400, "Invalid message id");
        const message = await ChatMessage.findById(messageId);
        if (!message) throw new ApiError(404, "Message not found");
        if (message.sender.toString() !== userId.toString()) {
          throw new ApiError(403, "You can delete only your own messages");
        }
        if (!message.deletedFor) message.deletedFor = [];
        if (!message.deletedFor.find((u) => u.toString() === userId.toString())) {
          message.deletedFor.push(userId);
          await message.save();
        }
        return res.json(new ApiResponse(200, { _id: message._id }, "Message deleted for user"));
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Internal Server Error"));
    }
});


export const getTeamsByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const role = req.user.role;
  
  try {
      if (!mongoose.Types.ObjectId.isValid(userId)) throw new ApiError(400, "Invalid user id");
      
      if (role !== "student" && role !== "mentor") throw new ApiError(400, "Invalid role");
      
      const teams = await Team.find({$or: [{ "members.user": userId },
        { mentor: userId }]} )
        .populate("members.user")
        .populate("mentor");
      
    if (!teams) throw new ApiError(404, "Teams not found");
    
    return res.status(200).json(new ApiResponse(200, teams, "Teams fetched successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
});