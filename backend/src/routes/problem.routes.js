import express from "express";
import {
  createProblem,
  getAllProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
} from "../controllers/problem.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/get-all", getAllProblems);
router.get("/:id", getProblemById);

// Protected routes
router.post("/create-problem", verifyJWT, createProblem);
router.put("/update/:id", verifyJWT, updateProblem);
router.delete("/delete/:id", verifyJWT, deleteProblem);

export default router;
