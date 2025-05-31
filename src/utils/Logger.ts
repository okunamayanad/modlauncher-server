export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, "DEBUG", message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, "INFO", message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, "WARN", message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, "ERROR", message, ...args);
  }

  private log(
    level: LogLevel,
    levelStr: string,
    message: string,
    ...args: any[]
  ): void {
    if (level < this.logLevel) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${levelStr}] ${message}`;

    if (args.length > 0) {
      console.log(logMessage, ...args);
    } else {
      console.log(logMessage);
    }
  }
}
