import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { mentorMatches, joinTeam } from "../controllers/mentor.controllers.js";

const router = Router();

router.get("/matches/:id", verifyJWT, mentorMatches);
router.post("/join-team/:teamId", verifyJWT, joinTeam);

export default router;


