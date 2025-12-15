import pinoHttp from "pino-http";
import { logger } from "../observability/logger";

export const httpLogger = pinoHttp({
  logger,
  genReqId(req, res) {
    const existing = req.headers["x-request-id"];
    if (typeof existing === "string" && existing.trim()) return existing.trim();
    const rid = (req as any).requestId;
    if (typeof rid === "string") return rid;
    // Return empty string instead of undefined for pino-http compatibility
    return "";
  },
  customLogLevel(_req, res, err) {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
        headers: {
          "user-agent": req.headers["user-agent"],
          "x-request-id": req.headers["x-request-id"],
        },
        remoteAddress: (req.socket as any)?.remoteAddress,
      };
    },
    res(res) {
      return { statusCode: res.statusCode };
    },
  },
});
