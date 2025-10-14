import dotenv from 'dotenv';
import { app } from "./app.js";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./db/index.js";

dotenv.config({
    path: './.env'
});

const PORT = process.env.PORT || 7000;

connectDB()
.then(() => {
    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            credentials: true,
        }
    });

    io.of(/^\/team\/.+$/).on("connection", (socket) => {
        // Namespace pattern like /team/:id
        const namespace = socket.nsp;
        const teamId = namespace.name.split("/")[2];
        socket.join(teamId);

        socket.on("message", (payload) => {
            // Fan out to room; persistence will be handled via REST endpoints
            io.of(namespace.name).to(teamId).emit("message", payload);
        });

        socket.on("disconnect", () => {});
    });

    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    server.on("error", (err) => {
        console.log("Server error", err)
    });
})
.catch((err) => {
    console.log("MongoDB connection error", err)
})