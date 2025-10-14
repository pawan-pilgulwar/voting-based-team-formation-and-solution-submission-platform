import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { castVote, getVoteCount } from "../controllers/vote.controllers.js";

const router = Router();

router.post("/:problemId", verifyJWT, castVote);
router.get("/:problemId/count", verifyJWT, getVoteCount);

export default router;


