import jwt from "jsonwebtoken";
import { CONFIG } from "../../config/project.config.js";

const {
  security: { jwtSecret: JWT_SECRET },
  swgApi,
  swg,
} = CONFIG;

const JWT_ISSUER = "swg_api";
const JWT_COOKIE = "swg_token";

function mostSpecificRoute(path, map = {}) {
  return Object.keys(map)
    .sort((a, b) => b.length - a.length)
    .find((k) => path === k || path.startsWith(k));
}

function roleFromCookie(req) {
  const token = req.cookies?.[JWT_COOKIE];
  if (!token) return "guest";

  try {
    const payload = jwt.verify(token, JWT_SECRET, { issuer: JWT_ISSUER });
    return payload?.role === "admin" ? "admin" : "user";
  } catch {
    return "guest";
  }
}


function resolveRiskLevel(path, role) {
  const csp = swg.csp;

  const routeKey = mostSpecificRoute(path, csp.routes);
  const routeRolesKey = mostSpecificRoute(path, csp.routeRoles);

  const rr = csp.routeRoles?.[routeRolesKey]?.[role]?.riskLevel;
  const r = csp.routes?.[routeKey]?.riskLevel;

  const riskLevel = rr || r || swg.defaultRiskLevel || "medium";
  return { riskLevel, routeKey, routeRolesKey };
}

/**
 * Resolve connect-src with base + routeAdd + roleAdd + routeRoleAdd
 */
function resolveConnectSrc(path, role) {
  const csp = swg.csp;
  const apiOrigin = swgApi.origin;

  const base = ["'self'", apiOrigin, ...(csp.base.connectSrc || [])];

  const routeKey = mostSpecificRoute(path, csp.routes);
  const routeRolesKey = mostSpecificRoute(path, csp.routeRoles);

  const routeAdd = csp.routes?.[routeKey]?.connectAdd || [];
  const roleAdd = csp.roles?.[role]?.connectAdd || [];
  const routeRoleAdd = csp.routeRoles?.[routeRolesKey]?.[role]?.connectAdd || [];

  const connectSrc = Array.from(
    new Set([...base, ...routeAdd, ...roleAdd, ...routeRoleAdd])
  );

  return { connectSrc };
}

/**
 * Resolve script-src with base + routeAdd + roleAdd + routeRoleAdd
 */
function resolveScriptSrc(path, role) {
  const csp = swg.csp;
  const d = csp.base.directives;

  const base = [...(d.scriptSrc || [])];

  const routeKey = mostSpecificRoute(path, csp.routes);
  const routeRolesKey = mostSpecificRoute(path, csp.routeRoles);

  const routeAdd = csp.routes?.[routeKey]?.scriptAdd || [];
  const roleAdd = csp.roles?.[role]?.scriptAdd || [];
  const routeRoleAdd = csp.routeRoles?.[routeRolesKey]?.[role]?.scriptAdd || [];

  const scriptSrc = Array.from(
    new Set([...base, ...routeAdd, ...roleAdd, ...routeRoleAdd])
  );

  return { scriptSrc };
}

function buildCspHeader({ connectSrc, scriptSrc }) {
  const d = swg.csp.base.directives;

  return [
    `default-src ${d.defaultSrc.join(" ")}`,
    `script-src ${scriptSrc.join(" ")}`,
    `img-src ${d.imgSrc.join(" ")}`,
    `style-src ${d.styleSrc.join(" ")}`,
    `font-src ${d.fontSrc.join(" ")}`,
    `connect-src ${connectSrc.join(" ")}`,
    `object-src ${d.objectSrc.join(" ")}`,
    `base-uri ${d.baseUri.join(" ")}`,
    `frame-ancestors ${d.frameAncestors.join(" ")}`,
  ].join("; ");
}

export function setSecurityHeaders(req, res, next) {
  const role = roleFromCookie(req);

  // NEW: resolve risk level (route/role aware)
  const { riskLevel, routeKey, routeRolesKey } = resolveRiskLevel(req.path, role);

  const { connectSrc } = resolveConnectSrc(req.path, role);
  const { scriptSrc } = resolveScriptSrc(req.path, role);

  res.setHeader("Content-Security-Policy", buildCspHeader({ connectSrc, scriptSrc }));

  // NEW: apply isolation headers from risk profile (fallback to defaults)
  const profile = swg.riskProfiles?.[riskLevel] || {};
  res.setHeader("Cross-Origin-Opener-Policy", profile.coop || swg.coopBase);
  res.setHeader("Cross-Origin-Embedder-Policy", profile.coep || swg.coepBase);
  res.setHeader("Cross-Origin-Resource-Policy", profile.corp || swg.corpBase);

  // Hardening
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");

  // Debug 
  res.setHeader("X-Debug-Role", role);
  res.setHeader("X-Debug-RiskLevel", riskLevel);
  res.setHeader("X-Debug-RouteMatch", routeKey || "");
  res.setHeader("X-Debug-RouteRoleMatch", routeRolesKey || "");

  next();
}