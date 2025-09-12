import express from 'express';
import cors from 'cors';

const app = express();

app.use(
    cors({
    origin: process.env.CORS_ORIGIN,
        credentials: true
    })
);

// Common middlewares
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))

// Route
import healthcheckRoutes from './routes/healthckeck.routes.js';

app.use("/api/v1/healthcheck", healthcheckRoutes); 

export { app };