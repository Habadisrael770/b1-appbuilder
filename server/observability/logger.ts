import pino from "pino";

const isProd = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProd ? "info" : "debug"),
  base: undefined, // remove pid/hostname unless you want them
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers.set-cookie",
      "req.headers.x-api-key",
      "req.body.password",
      "req.body.token",
      "req.body.refreshToken",
      "res.headers.set-cookie",
    ],
    remove: true,
  },
});
