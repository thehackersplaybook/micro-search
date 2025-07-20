import chalk from 'chalk';
import config from '../config/index.js';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function getTimestamp(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: config.TIMEZONE,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  };
  return now.toLocaleString('en-US', options);
}

function formatMessage(module: string, message: string, level: LogLevel = 'info'): string {
  const timestamp = getTimestamp();
  const moduleTag = chalk.cyan(`[${module}]`);
  const levelColor = {
    info: chalk.blue,
    warn: chalk.yellow,
    error: chalk.red,
    debug: chalk.gray,
  }[level];

  return `${chalk.gray(timestamp)} ${moduleTag} ${levelColor(message)}`;
}

export function info(module: string, ...messages: unknown[]): void {
  if (!config.VERBOSE && module === 'debug') return;
  console.log(formatMessage(module, messages.join(' '), 'info'));
}

export function warn(module: string, ...messages: unknown[]): void {
  console.warn(formatMessage(module, messages.join(' '), 'warn'));
}

export function error(module: string, ...messages: unknown[]): void {
  console.error(formatMessage(module, messages.join(' '), 'error'));
}

export function debug(module: string, ...messages: unknown[]): void {
  if (!config.VERBOSE) return;
  console.debug(formatMessage(module, messages.join(' '), 'debug'));
}
