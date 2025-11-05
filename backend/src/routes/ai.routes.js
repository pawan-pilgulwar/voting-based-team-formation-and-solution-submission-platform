import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { recommendForUser, recommendForMentor } from "../controllers/ai.controllers.js";

const router = Router();

router.get("/recommendations/user/:id", verifyJWT, recommendForUser);
router.get("/recommendations/mentor/:id", verifyJWT, recommendForMentor);

export default router;


