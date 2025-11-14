import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { saveCode, getTeamCodeFiles, getTeamCodeTree, deleteCodeFile, runCode, renameCodeFile } from "../controllers/code.controllers.js";

const router = Router();

router.post("/save", verifyJWT, saveCode);
router.get("/team/:teamId", verifyJWT, getTeamCodeFiles);
router.get("/team/:teamId/tree", verifyJWT, getTeamCodeTree);
router.post("/run", verifyJWT, runCode);
router.delete("/:fileId", verifyJWT, deleteCodeFile);
router.patch("/:fileId/rename", verifyJWT, renameCodeFile);

export default router;


