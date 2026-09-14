import * as fs from "fs";
import * as path from "path";

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const LOG_LEVEL_LABELS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: "DEBUG",
  [LogLevel.INFO]: "INFO",
  [LogLevel.WARN]: "WARN",
  [LogLevel.ERROR]: "ERROR",
};

const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: "\x1b[36m",
  [LogLevel.INFO]: "\x1b[32m",
  [LogLevel.WARN]: "\x1b[33m",
  [LogLevel.ERROR]: "\x1b[31m",
};

const RESET_COLOR = "\x1b[0m";

const LOGS_DIR = path.resolve(process.cwd(), "logs");

function ensureLogsDir(): void {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

function getLogFilePath(): string {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  return path.join(LOGS_DIR, `test-run-${dateStr}.log`);
}

function appendToFile(message: string): void {
  ensureLogsDir();
  const plainMessage = message.replace(/\x1b\[[0-9;]*m/g, "") + "\n";
  fs.appendFileSync(getLogFilePath(), plainMessage, "utf-8");
}

class Logger {
  private level: LogLevel;
  private context: string;

  constructor(context: string, level: LogLevel = LogLevel.INFO) {
    this.context = context;
    this.level = level;
  }

  private formatMessage(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString();
    const label = LOG_LEVEL_LABELS[level];
    let formatted = `[${timestamp}] [${label}] [${this.context}] ${message}`;
    if (data !== undefined) {
      formatted += ` ${JSON.stringify(data)}`;
    }
    return formatted;
  }

  private formatConsoleMessage(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString();
    const color = LOG_LEVEL_COLORS[level];
    const label = LOG_LEVEL_LABELS[level];
    let formatted = `${color}[${timestamp}] [${label}] [${this.context}]${RESET_COLOR} ${message}`;
    if (data !== undefined) {
      formatted += ` ${JSON.stringify(data)}`;
    }
    return formatted;
  }

  debug(message: string, data?: unknown): void {
    if (this.level <= LogLevel.DEBUG) {
      const msg = this.formatMessage(LogLevel.DEBUG, message, data);
      appendToFile(msg);
      console.log(this.formatConsoleMessage(LogLevel.DEBUG, message, data));
    }
  }

  info(message: string, data?: unknown): void {
    if (this.level <= LogLevel.INFO) {
      const msg = this.formatMessage(LogLevel.INFO, message, data);
      appendToFile(msg);
      console.log(this.formatConsoleMessage(LogLevel.INFO, message, data));
    }
  }

  warn(message: string, data?: unknown): void {
    if (this.level <= LogLevel.WARN) {
      const msg = this.formatMessage(LogLevel.WARN, message, data);
      appendToFile(msg);
      console.warn(this.formatConsoleMessage(LogLevel.WARN, message, data));
    }
  }

  error(message: string, data?: unknown): void {
    if (this.level <= LogLevel.ERROR) {
      const msg = this.formatMessage(LogLevel.ERROR, message, data);
      appendToFile(msg);
      console.error(this.formatConsoleMessage(LogLevel.ERROR, message, data));
    }
  }

  child(context: string): Logger {
    return new Logger(`${this.context}:${context}`, this.level);
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }
}

function resolveLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toUpperCase();
  if (envLevel && envLevel in LogLevel) {
    return LogLevel[envLevel as keyof typeof LogLevel];
  }
  return process.env.CI ? LogLevel.INFO : LogLevel.DEBUG;
}

let rootLevel = resolveLogLevel();

function createLogger(context: string): Logger {
  return new Logger(context, rootLevel);
}

function setGlobalLogLevel(level: LogLevel): void {
  rootLevel = level;
}

export { Logger, createLogger, setGlobalLogLevel, LOGS_DIR };
