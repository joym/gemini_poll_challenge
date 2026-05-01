// ─────────────────────────────────────────────
// Firebase Cloud Functions Entry Point ONLY
// ─────────────────────────────────────────────

const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');

// Firebase configuration
setGlobalOptions({
  region: 'asia-south1',
  timeoutSeconds: 60,
  memory: '256MiB',
});

// Import Express app
const app = require('./server/app');

// Firebase export
exports.api = onRequest(app);

// ❗ DO NOT call app.listen() here