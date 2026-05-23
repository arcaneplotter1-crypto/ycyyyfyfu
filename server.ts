import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import https from "https";
import http from "http";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    transports: ["polling", "websocket"],
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 45000,
    allowEIO3: true
  });

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/proxy", (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) return res.status(400).send("No url provided");
    
    const client = targetUrl.startsWith("https") ? https : http;
    const forwardHeaders = { ...req.headers };
    delete forwardHeaders.host;
    delete forwardHeaders.referer;
    
    client.get(targetUrl, { headers: forwardHeaders as any }, (proxyRes) => {
      const headers = { ...proxyRes.headers };
      headers["Access-Control-Allow-Origin"] = "*";
      headers["Cross-Origin-Resource-Policy"] = "cross-origin";
      res.writeHead(proxyRes.statusCode || 200, headers);
      proxyRes.pipe(res);
    }).on("error", (e) => {
      res.status(500).send(e.message);
    });
  });

  // Room state
  const rooms = new Map<string, any>();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("create_room", ({ name, participantId, settings }, callback) => {
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      socket.join(roomId);
      
      const pId = participantId || socket.id;
      const room = {
        id: roomId,
        hostId: socket.id,
        hostParticipantId: pId,
        participants: [{
          id: socket.id,
          participantId: pId,
          name,
          connected: true,
          finished: false,
          score: 0,
          time: 0
        }],
        exam: null,
        settings: settings || null,
        status: "lobby", // lobby, playing, finished
        mode: "independent", // independent, synchronized
        currentQuestionIndex: 0,
        startTime: null,
        chat: [{
          id: "sys_" + Date.now(),
          name: "System",
          message: `${name} created the room`,
          time: Date.now(),
          isSystem: true
        }],
        answers: {}, // participantId -> { questionId -> answer }
      };
      
      rooms.set(roomId, room);
      callback({ success: true, roomId });
      io.to(roomId).emit("room_update", room);
    });

    socket.on("join_room", ({ roomId, name, participantId }, callback) => {
      const room = rooms.get(roomId);
      if (!room) {
        if (callback) callback({ success: false, error: "Room not found" });
        return;
      }

      socket.join(roomId);
      
      // Check if participant already exists (reconnection)
      // Try by participantId first, then by name
      let existingParticipant = null;
      if (participantId) {
        existingParticipant = room.participants.find((p: any) => p.participantId === participantId);
      }
      
      if (!existingParticipant) {
        existingParticipant = room.participants.find((p: any) => p.name === name);
      }

      if (existingParticipant) {
        existingParticipant.id = socket.id;
        if (participantId) existingParticipant.participantId = participantId;
        existingParticipant.connected = true;
        
        if (room.hostParticipantId === existingParticipant.participantId) {
          room.hostId = socket.id;
        }
        
        room.chat.push({
          id: "sys_" + Date.now(),
          name: "System",
          message: `${name} reconnected`,
          time: Date.now(),
          isSystem: true
        });
      } else {
        room.participants.push({
          id: socket.id,
          participantId: participantId || socket.id,
          name,
          connected: true,
          finished: false,
          score: 0,
          time: 0
        });

        room.chat.push({
          id: "sys_" + Date.now(),
          name: "System",
          message: `${name} joined the room`,
          time: Date.now(),
          isSystem: true
        });
      }

      if (callback) callback({ success: true, roomId });
      io.to(roomId).emit("room_update", room);
    });

    const checkAllAnswered = (room: any, roomId: string) => {
      if (room.mode === "synchronized" && room.status === "playing") {
        const currentQId = room.exam[room.currentQuestionIndex].id;
        const connectedParticipants = room.participants.filter((p: any) => p.connected);
        
        if (connectedParticipants.length === 0) return; // Don't advance if empty
        
        const allAnswered = connectedParticipants.every((p: any) => room.answers[p.participantId] && room.answers[p.participantId][currentQId]);
          
        if (allAnswered && !room.isTransitioning) {
          room.isTransitioning = true;
          setTimeout(() => {
            room.isTransitioning = false;
            if (room.currentQuestionIndex < room.exam.length - 1) {
              room.currentQuestionIndex += 1;
              io.to(roomId).emit("next_question", room.currentQuestionIndex);
              io.to(roomId).emit("room_update", room);
            } else {
              room.status = "finished";
              room.participants.forEach((p: any) => {
                p.finished = true;
              });
              io.to(roomId).emit("exam_finished");
              io.to(roomId).emit("room_update", room);
            }
          }, 3000);
        }
      }
    };

    socket.on("leave_room", ({ roomId }) => {
      socket.leave(roomId);
      const room = rooms.get(roomId);
      if (room) {
        const participant = room.participants.find((p: any) => p.id === socket.id);
        if (participant) {
          participant.connected = false;
          room.chat.push({
            id: "sys_" + Date.now(),
            name: "System",
            message: `${participant.name} left the room`,
            time: Date.now(),
            isSystem: true
          });
        }
        checkAllAnswered(room, roomId);
        io.to(roomId).emit("room_update", room);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      rooms.forEach((room, roomId) => {
        const participant = room.participants.find((p: any) => p.id === socket.id);
        if (participant) {
          participant.connected = false;
          room.chat.push({
            id: "sys_" + Date.now(),
            name: "System",
            message: `${participant.name} disconnected`,
            time: Date.now(),
            isSystem: true
          });
          checkAllAnswered(room, roomId);
          io.to(roomId).emit("room_update", room);
        }
      });
    });

    socket.on("update_settings", ({ roomId, exam, settings, mode }) => {
      const room = rooms.get(roomId);
      if (room && room.hostId === socket.id && room.status === "lobby") {
        room.exam = exam;
        room.settings = settings;
        room.mode = mode;
        io.to(roomId).emit("room_update", room);
      }
    });

    socket.on("start_exam", ({ roomId }) => {
      const room = rooms.get(roomId);
      if (room && room.hostId === socket.id && room.status === "lobby") {
        room.status = "playing";
        room.startTime = Date.now();
        room.currentQuestionIndex = 0;
        room.answers = {};
        room.finishOrder = []; // Initialize finishOrder
        room.participants.forEach((p: any) => {
          p.finished = false;
          p.score = 0;
          p.time = 0;
        });
        io.to(roomId).emit("room_update", room);
        io.to(roomId).emit("exam_started");
      }
    });

    socket.on("submit_answer", ({ roomId, questionId, answer, isCorrect, timeTaken, points }) => {
      const room = rooms.get(roomId);
      if (room && room.status === "playing") {
        const participant = room.participants.find((p: any) => p.id === socket.id);
        if (!participant) return;

        const pId = participant.participantId;
        
        if (!room.answers[pId]) {
          room.answers[pId] = {};
        }
        
        const oldAnswer = room.answers[pId][questionId];
        const oldTime = oldAnswer ? oldAnswer.timeTaken : 0;
        const oldPoints = oldAnswer ? (oldAnswer.points || 0) : 0;

        room.answers[pId][questionId] = { answer, isCorrect, timeTaken, points: points || 0 };
        
        participant.score = (participant.score || 0) - oldPoints + (points || 0);
        if (room.mode === "synchronized") {
          participant.time += (timeTaken - oldTime);
        }

        checkAllAnswered(room, roomId);
        
        io.to(roomId).emit("room_update", room);
      }
    });

    socket.on("finish_exam", ({ roomId, timeTaken }) => {
      const room = rooms.get(roomId);
      if (room && room.status === "playing" && room.mode === "independent") {
        const participant = room.participants.find((p: any) => p.id === socket.id);
        if (participant && !participant.finished) {
          participant.finished = true;
          participant.time = timeTaken;
          
          // Track finishing order
          if (!room.finishOrder) {
            room.finishOrder = [];
          }
          room.finishOrder.push(participant.participantId);
          const order = room.finishOrder.length;
          
          // Emit specific event for this user to know their order
          socket.emit("finish_order", { order });
        }
        
        const allFinished = room.participants.filter((p: any) => p.connected).every((p: any) => p.finished);
        if (allFinished) {
          room.status = "finished";
          io.to(roomId).emit("exam_finished");
        }
        
        io.to(roomId).emit("room_update", room);
      }
    });

    socket.on("sync_timeout", ({ roomId }) => {
      const room = rooms.get(roomId);
      if (room && room.status === "playing" && room.mode === "synchronized") {
        // Host triggers this when timer runs out
        if (socket.id === room.hostId && !room.isTransitioning) {
          room.isTransitioning = true;
          setTimeout(() => {
            room.isTransitioning = false;
            if (room.currentQuestionIndex < room.exam.length - 1) {
              room.currentQuestionIndex += 1;
              io.to(roomId).emit("next_question", room.currentQuestionIndex);
              io.to(roomId).emit("room_update", room);
            } else {
              room.status = "finished";
              room.participants.forEach((p: any) => {
                p.finished = true;
              });
              io.to(roomId).emit("exam_finished");
              io.to(roomId).emit("room_update", room);
            }
          }, 3000);
        }
      }
    });

    socket.on("send_chat", ({ roomId, message, name }) => {
      const room = rooms.get(roomId);
      if (room) {
        const chatMsg = { id: Date.now().toString(), name, message, time: Date.now() };
        room.chat.push(chatMsg);
        io.to(roomId).emit("chat_message", chatMsg);
        io.to(roomId).emit("room_update", room);
      }
    });

    socket.on("return_to_lobby", ({ roomId }) => {
      const room = rooms.get(roomId);
      if (room && room.hostId === socket.id) {
        room.status = "lobby";
        room.exam = null;
        room.settings = null;
        room.answers = {};
        room.participants.forEach((p: any) => {
          p.finished = false;
          p.score = 0;
          p.time = 0;
        });
        io.to(roomId).emit("room_update", room);
      }
    });

    socket.on("use_power", ({ roomId, power, name }) => {
      const room = rooms.get(roomId);
      if (room) {
        io.to(roomId).emit("power_used", { power, name, userId: socket.id });
        room.chat.push({
          id: "sys_" + Date.now(),
          name: "System",
          message: `${name} used ${power.name}!`,
          time: Date.now(),
          isSystem: true
        });
        io.to(roomId).emit("room_update", room);
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
