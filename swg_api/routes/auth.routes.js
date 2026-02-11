import express from "express";
import jwt from "jsonwebtoken";
import { CONFIG } from "../../config/project.config.js";


const authRouter = express.Router();
const JWT_SECRET = CONFIG.security.jwtSecret;

authRouter.get("/me", (req, res) => {
  try {
    const token = req.cookies?.swg_token;
    if (!token) return res.status(401).json({ error: "No token" });

    const payload = jwt.verify(token, JWT_SECRET, { issuer: "swg_api" });
    res.json({ ok: true, payload });
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// --- Login ---
authRouter.post("/login", (req, res) => {
  const { username, password } = req.body ?? {};

  const isAdmin =
    username === CONFIG.security.adminLogin &&
    password === CONFIG.security.adminPassword;

  if (!isAdmin) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { sub: username, role: "admin" },
    JWT_SECRET,
    { expiresIn: "30m", issuer: "swg_api" }
  );

  // Set JWT in Cookie

  res.setHeader("Set-Cookie", [
    `swg_token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=1800`,
    `swg_logged_in=1; Path=/; SameSite=Lax; Max-Age=1800`
  ]);
  

  res.json({ ok: true, role: "admin" });
});

authRouter.post("/logout", (req, res) => {
  res.setHeader("Set-Cookie", [
    `swg_token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`,
    `swg_logged_in=; Path=/; SameSite=Lax; Max-Age=0`
  ]);
  res.json({ ok: true });
});

export default authRouter;