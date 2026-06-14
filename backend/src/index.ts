import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

import membersRouter from "./routes/members";
import segmentsRouter from "./routes/segments";
import campaignsRouter from "./routes/campaigns";
import aiRouter from "./routes/ai";
import receiptsRouter from "./routes/receipts";

dotenv.config();

const app = express();
const server = http.createServer(app);

const localhostOrigin = /^http:\/\/localhost:\d+$/;

export const io = new Server(server, {
  cors: {
    origin: localhostOrigin,
    methods: ["GET", "POST"],
  },
});

app.use(cors({
  origin: localhostOrigin,
  credentials: true,
}));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "FitReach Revivr Backend" });
});

app.use("/api/members", membersRouter);
app.use("/api/segments", segmentsRouter);
app.use("/api/campaigns", campaignsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/receipts", receiptsRouter);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT ?? 4000;
server.listen(PORT, () => {
  console.log(`FitReach Revivr Backend running on port ${PORT}`);
});
