// server/_core/index.ts
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import githubWebhookRouter from "../webhooks/github";
import { startBuildWorker } from "../buildWorker_v3";
import { initSentry } from "../observability/sentry";
import * as Sentry from "@sentry/node";
import { attachRequestId } from "../middleware/requestId";
import { httpLogger } from "../middleware/httpLogger";
import { healthz, readyz } from "../routes/health";

// Initialize Sentry before anything else
initSentry();

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Request ID must be first
  app.use((req, res, next) => {
    attachRequestId(req, res);
    next();
  });
  
  // Sentry request handler is automatic via expressIntegration in init
  
  // JSON logs
  app.use(httpLogger);
  
  // Health endpoints (before body parser)
  app.get("/healthz", healthz);
  app.get("/readyz", readyz);
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // GitHub webhook for build notifications
  app.use(githubWebhookRouter);
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  
  // Sentry error handler must be before your error middleware
  app.use(Sentry.expressErrorHandler());

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  // Start build worker
  startBuildWorker();
  console.log("✅ Build worker started");

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
