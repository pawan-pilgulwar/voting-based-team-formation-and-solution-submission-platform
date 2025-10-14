import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { saveCode, getTeamCodeFiles } from "../controllers/code.controllers.js";

const router = Router();

router.post("/save", verifyJWT, saveCode);
router.get("/team/:teamId", verifyJWT, getTeamCodeFiles);

export default router;


