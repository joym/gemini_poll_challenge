const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const { protect } = require('./middleware/authMiddleware');
const { generalLimiter, authLimiter, aiLimiter } = require('./middleware/rateLimiter');
const aiService = require('./services/aiService');

const app = express();

// ✅ SAFE DB CONNECTION (Cloud Run friendly)
if (process.env.MONGO_URI) {
  connectDB();
} else {
  console.warn("⚠️ No MongoDB URI provided, skipping DB connection");
}

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
    const allowed = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://votepath-ai-38a5e.web.app',
      'https://votepath-ai-38a5e.firebaseapp.com',
    ];
    if (!origin || allowed.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
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

// ── Public routes ──────────────────
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));

// ── Protected routes ─────────────────
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

// ✅ HEALTH CHECK
app.get('/api/health', async (req, res) => {
  try {
    const aiStatus = await aiService.getStatus();

    res.json({
      success: true,
      status: 'running',
      ai: aiStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.json({
      success: false,
      error: "Health check failed",
    });
  }
});

// Error handler
app.use(errorHandler);

module.exports = app;