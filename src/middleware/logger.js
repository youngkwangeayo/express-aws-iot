import winston from 'winston';
import path from 'path';

const logDir = process.env.LOG_DIR || process.cwd();

// 현재 날짜를 YYYY-MM-DD 형식으로 가져오기
const getDateString = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(({ level, timestamp, message }) => {
      const logObj = { level, time: timestamp, message };
      return JSON.stringify(logObj);
    })
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'logs', 'error', `${getDateString()}-error.log`),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'logs', 'combined', `${getDateString()}-info.log`)
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.printf(({ level, timestamp, message }) => {
        return `${level} ${timestamp} ${message}`;
      })
    )
  }));
}

// 기존 logger를 래핑해서 여러 인자를 message에 합치기
const originalInfo = logger.info.bind(logger);
logger.info = (message, ...args) => {
  if (args.length > 0) {
    const additionalData = args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    originalInfo(`${message} ${additionalData}`);
  } else {
    originalInfo(message);
  }
};

export const loggerMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });

  next();
};

export default logger;