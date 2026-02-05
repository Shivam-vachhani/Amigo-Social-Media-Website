import { createServer } from "http";
import next from "next";
import { Server as IOServer } from "socket.io";
import { setIO } from "./lib/io.js";

const port = 3000;
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new IOServer(httpServer, {
    cors: {
      origin: process.env.NEXTJS_APP_URL,
      credentials: true,
    },
  });

  setIO(io);

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    socket.on("join", (userId) => {
      console.log("➡️ join room:", `user:${userId}`);
      socket.join(`user:${userId}`);
    });

    socket.on("notification", (payload) => {
      io.to(`user:${payload.toUserId}`).emit("notification", payload);
    });


    socket.on("chatMessage", (payload) => {
      io.to(`user:${payload.toUserId}`).emit("chatMessage", payload)
    })

    
    socket.on("changeMsgSeen",(payload)=>{
       console.log("from socket server:",payload);
      io.to(`user:${payload.senderId}`).emit("changeMsgSeen",payload)
     
    })

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
});
