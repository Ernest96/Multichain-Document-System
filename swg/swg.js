import "../config/env.js";
import { CONFIG } from "../config/project.config.js";

import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { setSecurityHeaders } from "./middleware/policies.middleware.js";

const app = express();
const PORT = CONFIG.swg.port;

const DAPP_ORIGIN = CONFIG.swg.origin;

app.use(express.json());
app.use(cookieParser());

// Apply SecurityHeaders
app.use(setSecurityHeaders);

// Serve static files
app.use(express.static(path.join(process.cwd(), "../public")));

app.listen(PORT, () => {
  console.log(`SWG running at ${DAPP_ORIGIN}`);
});
