/**
 * Development Logger Utility
 * 
 * Provides controlled logging for development with the ability to 
 * filter by component or feature area.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogCategory = 'auth' | 'api' | 'ui' | 'general';

interface LogConfig {
  enabled: boolean;
  level: LogLevel;
  categories: LogCategory[];
}

const defaultConfig: LogConfig = {
  enabled: process.env.NODE_ENV === 'development',
  level: 'info',
  categories: ['auth', 'api', 'ui', 'general']
};

class Logger {
  private config: LogConfig;

  constructor(config: Partial<LogConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  private shouldLog(level: LogLevel, category: LogCategory): boolean {
    if (!this.config.enabled) return false;
    if (!this.config.categories.includes(category)) return false;
    
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  debug(message: string, category: LogCategory = 'general', ...args: any[]) {
    if (this.shouldLog('debug', category)) {
      console.debug(`[${category.toUpperCase()}]`, message, ...args);
    }
  }

  info(message: string, category: LogCategory = 'general', ...args: any[]) {
    if (this.shouldLog('info', category)) {
      console.info(`[${category.toUpperCase()}]`, message, ...args);
    }
  }

  warn(message: string, category: LogCategory = 'general', ...args: any[]) {
    if (this.shouldLog('warn', category)) {
      console.warn(`[${category.toUpperCase()}]`, message, ...args);
    }
  }

  error(message: string, category: LogCategory = 'general', ...args: any[]) {
    if (this.shouldLog('error', category)) {
      console.error(`[${category.toUpperCase()}]`, message, ...args);
    }
  }
}

// Export a default logger instance
export const logger = new Logger();

// Export the Logger class for custom instances
export { Logger };
export type { LogLevel, LogCategory, LogConfig };
