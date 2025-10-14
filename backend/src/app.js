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
// removed extended routers
import { errorHandler } from "./middlewares/errors.middlewares.js";


app.use("/api/v1/healthcheck", healthcheckRoutes);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/votes", voteRouter);
app.use("/api/v1/code", codeRouter);
app.use("/api/v1/chat", chatRouter);


// Error Handler Middleware
app.use(errorHandler);
export { app };
