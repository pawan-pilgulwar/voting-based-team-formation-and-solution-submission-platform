import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { submitSolution, reviewSolution } from "../controllers/solution.controllers.js";

const router = Router();

router.post("/submit", verifyJWT, submitSolution);
router.post("/review", verifyJWT, reviewSolution);

export default router;


