import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/Users.model.js";
import { Problem } from "../models/problemStatements.model.js";
import { Team } from "../models/teams.model.js";
import { Report } from "../models/reports.model.js";

export const listUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.find().select("-password -refreshToken").lean();
        return res.json(new ApiResponse(200, users));
        
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Internal Server Error"));
    }
});

export const listProblems = asyncHandler(async (req, res) => {
  try {
      const problems = await Problem.find().lean();
      return res.json(new ApiResponse(200, problems));
  } catch (error) {
      return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
});

export const listTeams = asyncHandler(async (req, res) => {
  try {
      const teams = await Team.find().populate("problem mentor members.user").lean();
      return res.json(new ApiResponse(200, teams));
  } catch (error) {
      return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
});

export const listReports = asyncHandler(async (req, res) => {
  try {
      const reports = await Report.find().lean();
      return res.json(new ApiResponse(200, reports));
  } catch (error) {
      return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
});

export const deleteUser = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
          return res.status(404).json(new ApiError(404, "User not found"));
        }
        return res.json(new ApiResponse(200, "User deleted successfully"));
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Internal Server Error"));
    }
});