import winston from 'winston';
import 'winston-daily-rotate-file';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'MM-DD-YYYY HH:mm:ss' }),
  // winston.format.colorize({ level: true }),
  winston.format.printf(
    info => `${info.timestamp} ${info.level}: ${info.message}`
  )
);
const transports = [
  new winston.transports.Console(),
  new winston.transports.DailyRotateFile({
    dirname: './logs',
    filename: 'Master-Bot-%DATE%.log',
    datePattern: 'MM-DD-YYYY',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
  })
];

const Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports
});

export default Logger;
