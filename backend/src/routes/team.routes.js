import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createTeam,
  formTeamByVoting,
  getAllTeams,
  getTeamById,
  updateTeamProgress,
} from "../controllers/team.controllers.js";

const router = Router();

// 🧠 AI-assisted team creation
router.post("/create", verifyJWT, createTeam);

// 🗳️ Voting-based team formation
router.post("/:problemId/form-by-voting", verifyJWT, formTeamByVoting);

// 📋 Get all teams or filter
router.get("/all-teams", verifyJWT, getAllTeams);

// 🔍 Get team by ID
router.get("/:teamId", verifyJWT, getTeamById);

// ⚙️ Update team progress
router.put("/:teamId/progress", verifyJWT, updateTeamProgress);

export default router;
