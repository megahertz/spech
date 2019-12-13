'use strict';

class Dictionary {
  constructor(items = []) {
    this.stringItems = new Set();
    this.regexpItems = [];

    items.forEach(this.add, this);
  }

  add(item) {
    if (typeof item !== 'string') {
      return;
    }

    item = item.trim();
    if (!item || item.startsWith('#')) {
      return;
    }

    const regExp = this.extractRegexp(item);
    if (regExp) {
      this.regexpItems.push(regExp);
      return;
    }

    this.stringItems.add(item.toLowerCase());
  }

  includes(text) {
    text = text.trim().toLowerCase();

    if (this.stringItems.has(text)) {
      return true;
    }

    return this.regexpItems.some(exp => exp.test(text));
  }

  /**
   * @param {string} item
   * @return {RegExp | undefined}
   * @private
   */
  extractRegexp(item) {
    if (!item.startsWith('/')) {
      return undefined;
    }

    const [match, exp, flags] = item.match(/^\/(.*)\/([gimsuy]*)$/) || [];
    if (match) {
      return new RegExp(exp, flags || undefined);
    }
  }
}

module.exports = Dictionary;
