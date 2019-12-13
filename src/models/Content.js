'use strict';

const LineIndex = require('./LineIndex');

class Content {
  constructor(text) {
    this.text = text;
    this.lineIndex = LineIndex.fromText(text);
  }

  toString() {
    return this.text;
  }

  /**
   * @param {number} position
   * @param {number} length
   * @return {Spech.FragmentPosition | null}
   */
  getFragmentLines(position, length) {
    return this.lineIndex.getFragmentLines(position, length);
  }
}

module.exports = Content;
