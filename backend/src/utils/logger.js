import winston from 'winston';
import path from 'path';

const logDir = process.env.LOG_DIR || '/var/log/nebulosamagica';
const logLevel = process.env.LOG_LEVEL || 'info';

const transports = [
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    maxsize: 10485760, // 10MB
    maxFiles: 5,
    tailable: true,
    format: winston.format.json()
  }),
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    maxsize: 10485760, // 10MB
    maxFiles: 5,
    tailable: true,
    format: winston.format.json()
  })
];

if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.simple(),
      level: logLevel
    })
  );
}

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports
});

export default logger;
