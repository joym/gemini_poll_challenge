require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env')
});

const app = require('./app');

// ✅ Cloud Run–compatible PORT
const PORT = process.env.PORT || 8080;

console.log('🚀 Starting server...');

// ✅ IMPORTANT:
// Start listening FIRST.
// Do NOT import or call anything that can throw
// before the server binds to the port.
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`✅ Server running on port ${PORT}`);

  // ✅ Post-start checks (safe, non-fatal)
  try {
    const aiService = require('./services/aiService');
    const status = await aiService.getStatus();
    console.log('🤖 AI Status:', status);
  } catch (err) {
    console.warn('⚠️ AI status check failed:', err.message);
  }
});