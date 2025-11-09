import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { postTeamMessage, getTeamMessages, getTeamsByUserId } from "../controllers/chat.controllers.js";

const router = Router();

router.post("/team/:teamId", verifyJWT, postTeamMessage);
router.get("/team/:teamId", verifyJWT, getTeamMessages);
router.get("/chatlist/:userId", verifyJWT, getTeamsByUserId);

export default router;


