import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv"

dotenv.config({
    path: './.env'
});

const app = express();
console.log(process.env.CORS_ORIGIN)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, //process.env.CORS_ORIGIN
    credentials: true,
  })
);

// Common middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// import Routes
import healthcheckRoutes from "./routes/healthckeck.routes.js";
import userRouter from "./routes/user.routes.js";
import voteRouter from "./routes/vote.routes.js";
import codeRouter from "./routes/code.routes.js";
import chatRouter from "./routes/chat.routes.js";
import solutionRouter from "./routes/solution.routes.js";
import problemRouter from "./routes/problem.routes.js";
import teamRouter from "./routes/team.routes.js";
import aiRouter from "./routes/ai.routes.js";
import adminRouter from "./routes/admin.routes.js";
import mentorRouter from "./routes/mentor.routes.js";
// removed extended routers
import { errorHandler } from "./middlewares/errors.middlewares.js";


// API Routes
app.use("/api/v1/teams", teamRouter);
app.use("/api/v1/problems", problemRouter);
app.use("/api/v1/healthcheck", healthcheckRoutes);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/votes", voteRouter);
app.use("/api/v1/code", codeRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/solution", solutionRouter);
app.use("/api/v1/ai", aiRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/mentors", mentorRouter);

// Error Handler Middleware
app.use(errorHandler);
export { app };
