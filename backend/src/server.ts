import app from './app';
import { config } from './config/env';
import { redisService } from './services/redis.service';
import logger from './utils/logger';

const PORT = config.port;

async function startServer() {
  try {
    // Connect to Redis
    await redisService.connect();
    logger.info('Connected to Redis');

    // Start Express server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown');
        process.exit(1);
      }, 10000);
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully');
      await redisService.disconnect();
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', { error: error.message });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection', { reason });
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

startServer();
