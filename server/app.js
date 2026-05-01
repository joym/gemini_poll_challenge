const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const { errorHandler } = require('./middleware/errorHandler');
const { protect } = require('./middleware/authMiddleware');
const { generalLimiter, authLimiter, aiLimiter } = require('./middleware/rateLimiter');

const app = express();

// ── Security Middleware ────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));
app.use(mongoSanitize());
app.use(generalLimiter);

// ── Core Middleware ─────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ✅ ROOT ROUTE (VERY IMPORTANT FOR CLOUD RUN)
app.get('/', (req, res) => {
  res.send('🚀 VotePath AI API is running');
});

// ── Routes ─────────────────────────
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));

app.use('/api/user', protect, require('./routes/userRoutes'));
app.use('/api/journey', protect, aiLimiter, require('./routes/journeyRoutes'));
app.use('/api/chat', protect, aiLimiter, require('./routes/chatRoutes'));
app.use('/api/checklist', protect, require('./routes/checklistRoutes'));
app.use('/api/timeline', protect, aiLimiter, require('./routes/timelineRoutes'));
app.use('/api/scenario', protect, aiLimiter, require('./routes/scenarioRoutes'));
app.use('/api/quiz', protect, require('./routes/quizRoutes'));
app.use('/api/booth', protect, aiLimiter, require('./routes/boothRoutes'));
app.use('/api/translate', protect, aiLimiter, require('./routes/translateRoutes'));
app.use('/api/analytics', protect, require('./routes/analyticsRoutes'));

// ✅ BASIC HEALTH CHECK (NO AI / DB)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;