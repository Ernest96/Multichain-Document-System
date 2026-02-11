import "../config/env.js";
import { CONFIG } from "../config/project.config.js";


import express from "express";
import cookieParser from "cookie-parser";
import studentsRouter from "./routes/students.routes.js";
import authRouter from "./routes/auth.routes.js";
import { corsMiddleware } from "./middleware/cors.middleware.js";

const app = express();
const HOST = CONFIG.swgApi.host;
const PORT = CONFIG.swgApi.port;
const DAPP_ORIGIN = `${CONFIG.swg.host}:${CONFIG.swg.port}`;

app.use(express.json());
app.use(cookieParser());

app.use(corsMiddleware);
app.use("/api/students", studentsRouter);
app.use("/auth", authRouter);

// Home route
app.get("/", (req, res) => {
  res.json({ service: "SWG API"
  });
});

app.listen(PORT, () => {
  console.log(`SWG_API running at ${HOST}:${PORT}`);
  console.log(`Allowed dApp origin: ${DAPP_ORIGIN}`);
});
