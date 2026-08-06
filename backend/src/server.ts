import dotenv from 'dotenv';
// Load environment variables
dotenv.config();

// Force Node.js to UTC — all new Date() / date math uses UTC
process.env.TZ = 'UTC';

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

import { createServer } from 'http';
import app from './app';
import { initializeWebSocket } from './config/websocket';

const PORT = process.env.PORT || 5000;

// Create HTTP server (required for WebSocket)
const httpServer = createServer(app);

// Initialize WebSocket
initializeWebSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`🔌 WebSocket enabled`);
  const brevoKey = process.env.BREVO_API_KEY;
  console.log(`📧 Email service: ${brevoKey ? 'configured' : 'MISSING API KEY'}`);
  console.log(`=================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
  });
});
export default httpServer;
