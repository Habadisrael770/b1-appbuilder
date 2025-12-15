import type { IncomingMessage, ServerResponse } from "http";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

function json(res: ServerResponse, code: number, payload: unknown) {
  res.statusCode = code;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

export async function healthz(_req: IncomingMessage, res: ServerResponse) {
  // Liveness: process is up
  json(res, 200, { ok: true });
}

export async function readyz(_req: IncomingMessage, res: ServerResponse) {
  // Readiness: dependencies OK (DB)
  try {
    const db = await getDb();
    if (!db) {
      json(res, 503, { ok: false, db: "unavailable" });
      return;
    }
    // Minimal query. Works across Drizzle adapters.
    await db.execute(sql`select 1 as ok`);
    json(res, 200, { ok: true, db: "up" });
  } catch (e) {
    json(res, 503, { ok: false, db: "down" });
  }
}
