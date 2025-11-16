import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  submitSolution,
  reviewSolution,
  addFeedback,
  getSolutionById,
  getSolutionsByTeamId,
  getSolutionsByProblemId,
} from "../controllers/solution.controllers.js";

const router = Router();

router.post("/submit", verifyJWT, submitSolution);
router.post("/review", verifyJWT, reviewSolution);
router.post("/:solutionId/feedback", verifyJWT, addFeedback);
router.get("/team/:teamId", verifyJWT, getSolutionsByTeamId);
router.get("/problem/:problemId", verifyJWT, getSolutionsByProblemId);
router.get("/:solutionId", verifyJWT, getSolutionById);

export default router;


