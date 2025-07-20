import chalk from 'chalk';
import config from '../config';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const log = (level: LogLevel, tag: string, message: string, ...args: unknown[]) => {
  const timestamp = new Date().toISOString();
  let coloredMessage = `[${timestamp}] [${tag}]`;

  switch (level) {
    case 'info':
      coloredMessage += chalk.blue(` ${message}`);
      break;
    case 'warn':
      coloredMessage += chalk.yellow(` ${message}`);
      break;
    case 'error':
      coloredMessage += chalk.red(` ${message}`);
      break;
    case 'debug':
      if (!config.VERBOSE) return; // Only log debug if verbose is true
      coloredMessage += chalk.gray(` ${message}`);
      break;
    default:
      coloredMessage += ` ${message}`;
  }

  console.log(coloredMessage, ...args);
};

export const info = (tag: string, message: string, ...args: unknown[]) => log('info', tag, message, ...args);
export const warn = (tag: string, message: string, ...args: unknown[]) => log('warn', tag, message, ...args);
export const error = (tag: string, message: string, ...args: unknown[]) => log('error', tag, message, ...args);
export const debug = (tag: string, message: string, ...args: unknown[]) => log('debug', tag, message, ...args);
