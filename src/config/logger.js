import winston from 'winston';
import path from 'path';

const logDir = process.env.LOG_DIR || process.cwd();

// 현재 날짜를 YYYY-MM-DD 형식으로 가져오기
const getDateString = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// 순환 참조를 안전하게 처리하는 JSON stringify
const safeStringify = (obj) => {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  }, 2);
};

// 여러 인자를 하나의 문자열로 합치는 헬퍼 함수
const combineArgs = (...args) => {
  return args.map(arg =>
    typeof arg === 'object' ? safeStringify(arg) : String(arg)
  ).join(' ');
};

// 커스텀 포맷: [LEVEL] [TIMESTAMP] message : 내용
const customFormat = winston.format.printf(({ level, timestamp, message }) => {
  const levelUpper = level.toUpperCase();
  return `[${levelUpper}] [${timestamp}] message : ${message}`;
});

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    customFormat
  ),
  transports: [
    // ERROR 로그 - 파일에 기록
    new winston.transports.File({
      filename: path.join(logDir, 'logs/agnet', 'error', `${getDateString()}-error.log`),
      level: 'error'
    }),
    // INFO 로그 - 파일에 기록
    new winston.transports.File({
      filename: path.join(logDir, 'logs/agnet', 'combined', `${getDateString()}-info.log`),
      level: 'info'
    })
  ]
});

// 콘솔 출력 (모든 레벨 포함 DEBUG도)
logger.add(new winston.transports.Console({
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    customFormat
  )
}));

// 기존 logger 메서드들을 래핑해서 여러 인자를 하나의 메시지로 합치기
const originalInfo = logger.info.bind(logger);
const originalDebug = logger.debug.bind(logger);
const originalError = logger.error.bind(logger);

logger.info = (...args) => {
  const message = combineArgs(...args);
  originalInfo(message);
};

logger.debug = (...args) => {
  const message = combineArgs(...args);
  originalDebug(message);
};

logger.error = (...args) => {
  const message = combineArgs(...args);
  originalError(message);
};

export default logger;
export const debug = logger.debug;