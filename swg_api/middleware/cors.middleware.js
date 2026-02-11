import { CONFIG } from "../../config/project.config.js";

const {
  allowOriginsExtra,
  allowMethods,
  allowHeaders,
} = CONFIG.swgApi.cors;

const DAPP_ORIGIN = `${CONFIG.swg.host}:${CONFIG.swg.port}`;

export function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;

  if (origin == DAPP_ORIGIN || allowOriginsExtra.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader(
      "Access-Control-Allow-Methods",
      allowMethods.join(",")
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      allowHeaders.join(",")
    );

    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  // Preflight
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
}
