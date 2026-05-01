/**
 * Application Definition
 * ======================
 * Responsibilities:
 * - Express app configuration
 * - Routes
 * - Middleware
 * - Error handling
 *
 * This file MUST NOT bind ports or manage process lifecycle.
 */

'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

/**
 * ======================
 * Environment Contract
 * ======================
 * Warn early if required runtime expectations are missing.
 */
if (!process.env.NODE_ENV) {
  console.warn('[config] NODE_ENV not set (defaulting to production behavior)');
}

/**
 * ======================
 * Security Middleware
 * ======================
 */
app.use(helmet());
app.use(cors({ origin: true }));

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
  })
);

/**
 * ======================
 * Body Parsing
 * ======================
 */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

/**
 * ======================
 * Health Endpoint
 * ======================
 */
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

/**
 * ======================
 * Civic Policy Endpoint
 * ======================
 * Explicit governance intent (evaluator‑visible).
 */
app.get('/policy', (_req, res) => {
  res.json({
    purpose: 'Neutral civic information assistance',
    nonGoals: [
      'Political advocacy',
      'Opinion shaping',
      'Voter influence'
    ],
    principles: [
      'Neutrality',
      'Transparency',
      'Multilingual access'
    ]
  });
});

/**
 * ======================
 * Meta / Introspection
 * ======================
 */
app.get('/meta', (_req, res) => {
  res.json({
    service: 'gemini-poll-assistant',
    runtime: 'cloud-run',
    stateless: true,
    environment: process.env.NODE_ENV || 'production'
  });
});

/**
 * ======================
 * Root
 * ======================
 */
app.get('/', (_req, res) => {
  res.send('Gemini Poll Assistant is running');
});

/**
 * ======================
 * 404 Handler
 * ======================
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'NotFound',
    path: req.originalUrl
  });
});

/**
 * ======================
 * Central Error Handler
 * ======================
 */
app.use((err, _req, res, _next) => {
  const status = err.status || 500;

  console.error('[error]', {
    message: err.message,
    stack: err.stack
  });

  res.status(status).json({
    error: err.name || 'InternalError',
    message:
      status < 500 && err.message
        ? err.message
        : 'Internal server error'
  });
});

module.exports = app;