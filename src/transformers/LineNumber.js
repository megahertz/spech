'use strict';

const Transformer = require('./Transformer');

class LineNumber extends Transformer {
  /**
   * @param {Document} document
   * @return {Document}
   * @package
   */
  modifyDocument(document) {
    this.index = LineNumber.buildIndex(document.text);
    this.textLength = document.text.length;
    return document;
  }

  /**
   * @param {Correction} correction
   * @return {Correction}
   * @package
   */
  modifyCorrection(correction) {
    const lineInfo = this.getFragmentLines(
      correction.position,
      correction.length
    );

    if (!lineInfo) {
      return null;
    }

    correction.startLine = lineInfo.startLine;
    correction.endLine = lineInfo.endLine;

    return correction;
  }

  /**
   * @param {number} position
   * @param {number} length
   * @return {Spech.FragmentPosition | null}
   * @package
   */
  getFragmentLines(position, length) {
    const result = {
      startLine: { number: -1, position: -1 },
      endLine: { number: -1, position: -1 },
    };

    const outOfRange = position < 0 || position + length > this.textLength;
    if (outOfRange) {
      return null;
    }

    const startPosition = position;
    const endPosition = position + length;

    let startLine = 0;
    let endLine = 0;

    for (let i = 0; i < this.index.length; i++) {
      const lineIndex = this.index[i];

      if (lineIndex <= startPosition) {
        startLine = i;
      } else {
        result.startLine.number = startLine;
      }

      if (lineIndex <= endPosition) {
        endLine = i;
      } else {
        result.endLine.number = endLine;
      }

      if (result.startLine.number > -1 && result.endLine.number > -1) {
        break;
      }
    }

    if (result.startLine.number === -1) {
      result.startLine.number = startLine;
    }

    if (result.endLine.number === -1) {
      result.endLine.number = endLine;
    }

    const startLinePosition = this.index[result.startLine.number];
    result.startLine.position = startPosition - startLinePosition;

    const endLinePosition = this.index[result.endLine.number];
    result.endLine.position = endPosition - endLinePosition;

    const allFieldsFilled = result.startLine.number > -1
      && result.startLine.position > -1
      && result.endLine.number > -1
      && result.endLine.position > -1;

    if (!allFieldsFilled) {
      throw new Error('Cannot find the exact fragment lines');
    }

    return result;
  }

  /**
   * @param {string} text
   * @return {number[]}
   * @package
   */
  static buildIndex(text) {
    const index = [];

    if (text.length < 1) {
      return [0];
    }

    let position = 0;
    while (position > -1) {
      index.push(position + 1);
      position = text.indexOf('\n', position + 1);
    }

    index[0] = 0;

    if (text.length <= index[index.length - 1]) {
      index.pop();
    }

    return index;
  }
}

module.exports = LineNumber;
