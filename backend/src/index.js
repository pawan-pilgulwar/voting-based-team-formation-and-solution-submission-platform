import dotenv from 'dotenv';
import { app } from "./app.js";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./db/index.js";

dotenv.config();

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

    // Attach io to app for access in route handlers/controllers
    app.set("io", io);

    // Helper to build a room name per team + file
    const getFileRoom = (teamId, fileId) => `code:${teamId}:${fileId}`;


    io.of(/^\/team\/.+$/).on("connection", (socket) => {
        // Namespace pattern like /team/:id
        const namespace = socket.nsp;
        const teamId = namespace.name.split("/")[2];

        
        if (!teamId) {
            console.warn("[socket] Connected to team namespace without teamId");
            return;
        }
        
        // Join general team room (used for chat etc.)
        socket.join(teamId);
        
        // =================  CHAT EVENTS  =========================
        socket.on("message", (payload) => {
            // Broadcast to everyone in this team
            io.of(namespace.name).to(teamId).emit("message", payload);
        });
        

        // ========== CODE COLLABORATION EVENTS (NEW) ==========
         // When user focuses/opens a file in editor
        socket.on("code:joinFile", ({ fileId }) => {
            if (!fileId) return;
            const room = getFileRoom(teamId, fileId);
            socket.join(room);
            // (Optional) you can emit presence info here later
        });

        // When user closes/leaves a file
        socket.on("code:leaveFile", ({ fileId }) => {
            if (!fileId) return;
            const room = getFileRoom(teamId, fileId);
            socket.leave(room);
        });

        // When a student types in the editor
        socket.on("code:change", ({ fileId, content, userId, username }) => {
            if (!fileId) return;

            const room = getFileRoom(teamId, fileId);

            // Broadcast to everyone else viewing the same file
            socket.to(room).emit("code:change", {
            teamId,
            fileId,
            content,
            userId,
            username,
            });
        });

        // When a user opens the directory view
        socket.on("directory:join", () => {
            const room = `dir:${teamId}`;
            socket.join(room);
        });

        // When user closes directory panel or navigates away
        socket.on("directory:leave", () => {
            const room = `dir:${teamId}`;
            socket.leave(room);
        });

        // // When a change is made to the directory (file/folder added, renamed, deleted)
        // socket.on("directory:update", ({files, fileId}) => {
        //     const room = `dir:${fileId}`;
        //     socket.to(room).emit("directory:update", files);
        // });

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