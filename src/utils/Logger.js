'use strict';

const LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

class Logger {
  constructor(level) {
    this.level = level;

    this.error = this.log.bind(this, 'error');
    this.warn = this.log.bind(this, 'warn');
    this.info = this.log.bind(this, 'info');
    this.debug = this.log.bind(this, 'debug');
  }

  log(level, ...args) {
    if (this.level < LEVELS[level]) {
      return;
    }

    console[level](...args);
  }

  callback(prefix, level = 'info') {
    return (...args) => this[level](prefix, args);
  }
}

module.exports = Logger;
