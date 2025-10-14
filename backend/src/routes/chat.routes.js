import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { postTeamMessage, getTeamMessages } from "../controllers/chat.controllers.js";

const router = Router();

router.post("/team/:teamId", verifyJWT, postTeamMessage);
router.get("/team/:teamId", verifyJWT, getTeamMessages);

export default router;


