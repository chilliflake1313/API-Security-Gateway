import winston from 'winston';
import path from 'path';
import { config } from '../config/env';
import { LogEntry } from '../types';

const logsDir = config.log.dir;

const logger = winston.createLogger({
  level: config.log.level,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
    }),
  ],
});

if (config.nodeEnv !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export const logRequest = (entry: LogEntry) => {
  logger.info('REQUEST', entry);
};

export const logError = (error: Error, context?: string) => {
  logger.error('ERROR', { error: error.message, stack: error.stack, context });
};

export const logWarning = (message: string, data?: any) => {
  logger.warn('WARNING', { message, data });
};

export default logger;
