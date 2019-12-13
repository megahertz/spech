'use strict';

class Printer {
  /**
   * @param {module:tty.WriteStream} stream
   * @param {boolean} useColors
   */
  constructor(stream = process.stderr, useColors = true) {
    this.stream = stream;
    this.useColors = useColors;
  }

  /**
   * Print multiple items
   * @param {Spech.PrintItem} data
   * @return {void}
   */
  batch(data) {
    if (Array.isArray(data)) {
      data.forEach(this.batch, this);
      return;
    }

    if (data && (typeof data.text === 'string' || data.newLine)) {
      this.write(data.text || '', data);
    }

    if (typeof data === 'string') {
      this.write(data);
    }
  }

  /**
   * @param {string} value
   * @param {Spech.PrintItemObject} options
   */
  write(value, options = {}) {
    if (!this.stream) {
      return;
    }

    value = value || '';

    if (options.indent) {
      value = value
        .split('\n').map(line => '  '.repeat(options.indent) + line)
        .join('\n');
    }

    if (options.color && this.useColors) {
      value = color(options.color, value);
    }

    if (options.newLine) {
      value += '\n';
    }

    this.stream.write(value);
  }

  /**
   * @param {string} value
   * @param {Spech.PrintItemObject} options
   */
  writeLn(value, options = {}) {
    this.write(value, { ...options, newLine: true });
  }
}

module.exports = Printer;

Object.assign(color, {
  unset: '\x1b[0m',
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bgRed: '\x1b[41m\x1b[30m',
  bgGreen: '\x1b[42m\x1b[30m',
});

function color(name, text) {
  if (typeof color[name] !== 'string') {
    return text;
  }

  return color[name] + text + color.unset;
}
