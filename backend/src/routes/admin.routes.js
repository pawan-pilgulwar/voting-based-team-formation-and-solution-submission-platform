import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { listUsers, listProblems, listTeams, listReports } from "../controllers/admin.controllers.js";

const router = Router();

// Simple gate: require auth; frontend controls access by role
router.get("/users", verifyJWT, listUsers);
router.get("/problems", verifyJWT, listProblems);
router.get("/teams", verifyJWT, listTeams);
router.get("/reports", verifyJWT, listReports);

export default router;


