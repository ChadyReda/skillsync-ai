import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { verifyClerkToken } from "./auth";
import {
  getDbUserByClerkId,
  insertMessage,
  isConversationMember,
  MessageType,
} from "./db";

dotenv.config();

const PORT = process.env.PORT ?? 3001;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? "http://localhost:3000";
const SOCKET_SECRET = process.env.SOCKET_SECRET;

const app = express();
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ─── Auth middleware ───────────────────────────────────────────────────────────

interface AuthenticatedSocket extends Socket {
  clerkId?: string;
  dbUserId?: string;
  dbUserEmail?: string;
}

io.use(async (socket: AuthenticatedSocket, next) => {
  try {
    const secret = socket.handshake.auth?.secret as string | undefined;
    if (SOCKET_SECRET && secret !== SOCKET_SECRET) {
      return next(new Error("Unauthorized"));
    }

    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Unauthorized"));

    const clerkId = await verifyClerkToken(token);
    const dbUser = await getDbUserByClerkId(clerkId);
    if (!dbUser) return next(new Error("User not found"));

    socket.clerkId = clerkId;
    socket.dbUserId = dbUser.id;
    socket.dbUserEmail = dbUser.email;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

// ─── Connection handler ────────────────────────────────────────────────────────

io.on("connection", (rawSocket: Socket) => {
  const socket = rawSocket as AuthenticatedSocket;
  console.log(`[+] ${socket.dbUserEmail} connected (${socket.id})`);

  // Join a conversation room
  socket.on("join-conversation", async (conversationId: string) => {
    const allowed = await isConversationMember(
      socket.dbUserId!,
      conversationId
    );
    if (!allowed) {
      socket.emit("error", { message: "Not a member of this conversation" });
      return;
    }
    socket.join(`conversation:${conversationId}`);
  });

  // Leave a conversation room
  socket.on("leave-conversation", (conversationId: string) => {
    socket.leave(`conversation:${conversationId}`);
  });

  // Typing indicators — broadcast to room members excluding the sender
  socket.on("typing", (data: { conversationId: string }) => {
    socket.to(`conversation:${data.conversationId}`).emit("partner-typing");
  });

  socket.on("stop-typing", (data: { conversationId: string }) => {
    socket.to(`conversation:${data.conversationId}`).emit("partner-stop-typing");
  });

  // Text message
  socket.on(
    "send-message",
    async (data: { conversationId: string; content: string; optimisticId?: string }) => {
      try {
        const allowed = await isConversationMember(
          socket.dbUserId!,
          data.conversationId
        );
        if (!allowed) {
          socket.emit("error", { message: "Not a member of this conversation" });
          return;
        }

        const message = await insertMessage(
          data.conversationId,
          socket.dbUserId!,
          data.content,
          "text",
          null,
          socket.dbUserEmail!
        );

        io.to(`conversation:${data.conversationId}`).emit("new-message", {
          ...message,
          optimisticId: data.optimisticId,
        });
      } catch (err) {
        console.error("send-message error:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    }
  );

  // File message (image or audio — URL already uploaded via UploadThing)
  socket.on(
    "send-file",
    async (data: {
      conversationId: string;
      fileUrl: string;
      messageType: MessageType;
      optimisticId?: string;
    }) => {
      try {
        if (!["image", "audio"].includes(data.messageType)) {
          socket.emit("error", { message: "Invalid message type" });
          return;
        }

        const allowed = await isConversationMember(
          socket.dbUserId!,
          data.conversationId
        );
        if (!allowed) {
          socket.emit("error", { message: "Not a member of this conversation" });
          return;
        }

        const message = await insertMessage(
          data.conversationId,
          socket.dbUserId!,
          null,
          data.messageType,
          data.fileUrl,
          socket.dbUserEmail!
        );

        io.to(`conversation:${data.conversationId}`).emit("new-message", {
          ...message,
          optimisticId: data.optimisticId,
        });
      } catch (err) {
        console.error("send-file error:", err);
        socket.emit("error", { message: "Failed to send file" });
      }
    }
  );

  socket.on("disconnect", () => {
    console.log(`[-] ${socket.dbUserEmail} disconnected (${socket.id})`);
  });
});

// ─── Start ─────────────────────────────────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`SkillSync socket server running on port ${PORT}`);
  console.log(`Accepting connections from: ${ALLOWED_ORIGIN}`);
});
