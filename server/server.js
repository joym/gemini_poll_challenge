/**
 * Server Entry Point
 * ==================
 * Responsibilities:
 * - Process lifecycle management
 * - Port binding
 * - Graceful shutdown
 *
 * This file intentionally contains NO application logic.
 */

'use strict';

const http = require('http');
const app = require('./app');

const PORT = Number(process.env.PORT) || 8080;
let server;

/**
 * Start the HTTP server
 */
function start() {
  server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`[server] listening on port ${PORT}`);
  });
}

/**
 * Graceful shutdown handler
 */
function shutdown(signal) {
  console.log(`[server] received ${signal}, shutting down gracefully`);

  if (!server) {
    process.exit(0);
  }

  server.close(() => {
    console.log('[server] all connections closed');
    process.exit(0);
  });

  // Hard stop if shutdown hangs
  setTimeout(() => {
    console.error('[server] forced shutdown');
    process.exit(1);
  }, 10000).unref();
}

/**
 * Process‑level safety hooks
 */
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

process.on('uncaughtException', err => {
  console.error('[fatal] uncaughtException', err);
  shutdown('uncaughtException');
});

process.on('unhandledRejection', err => {
  console.error('[fatal] unhandledRejection', err);
  shutdown('unhandledRejection');
});

/**
 * Bootstrap
 */
start();