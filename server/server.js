require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const app = require('./app');
const aiService = require('./services/aiService');

// ✅ Cloud Run compatible port
const PORT = process.env.PORT || 8080;

console.log("🚀 Starting server...");

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`✅ Server running on port ${PORT}`);

  // ✅ Safe AI status check (won’t crash if API fails)
  try {
    const status = await aiService.getStatus();
    console.log('🤖 AI Status:', status);
  } catch (err) {
    console.warn('⚠️ AI status check failed:', err.message);
  }
});