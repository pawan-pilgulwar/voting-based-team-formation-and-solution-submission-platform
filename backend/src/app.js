import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(
    cors({
    origin: "*", //process.env.CORS_ORIGIN
        credentials: true
    })
);

// Common middlewares
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// import Routes
import healthcheckRoutes from './routes/healthckeck.routes.js';
import userRouter from './routes/user.routes.js';
import { errorHandler } from './middlewares/errors.middlewares.js';

app.use("/api/v1/healthcheck", healthcheckRoutes); 
app.use("/api/v1/users", userRouter);

// Error Handler Middleware
app.use(errorHandler);
export { app };