import { randomUUID } from "crypto";
import type { IncomingMessage, ServerResponse } from "http";

export function getOrCreateRequestId(req: IncomingMessage): string {
  const header = req.headers["x-request-id"];
  if (typeof header === "string" && header.trim()) return header.trim();
  return randomUUID();
}

export function attachRequestId(req: IncomingMessage, res: ServerResponse): string {
  const rid = getOrCreateRequestId(req);
  (req as any).requestId = rid;
  res.setHeader("x-request-id", rid);
  return rid;
}
