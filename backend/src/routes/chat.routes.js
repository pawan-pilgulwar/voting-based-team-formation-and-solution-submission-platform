import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { postTeamMessage, getTeamMessages, getTeamsByUserId, deleteMessage } from "../controllers/chat.controllers.js";

const router = Router();

router.post("/team/:teamId", verifyJWT, postTeamMessage);
router.get("/team/:teamId", verifyJWT, getTeamMessages);
router.get("/chatlist/:userId", verifyJWT, getTeamsByUserId);
router.delete("/message/:messageId", verifyJWT, deleteMessage);

export default router;
