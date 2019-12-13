'use strict';

module.exports = {
  correctionFactory,
};

function correctionFactory({ showProvider = false } = {}) {
  /**
   * @param {Correction} correction
   * @return {Spech.PrintItem}
   */
  return function buildCorrection(correction) {
    const line = (correction.startLine.number + 1).toString(10).padStart(4);
    const pos = (correction.startLine.position + 1).toString(10).padEnd(4);
    const result = [
      { text: `${line}:${pos} `, color: 'gray' },
    ];

    if (correction.provider) {
      result.push({ text: `[${correction.provider}] `, color: 'gray' });
    }

    result.push({ text: correction.fragment, color: 'red' });

    if (correction.message) {
      result.push({ text: ': ', color: 'red' });
      result.push({ text: correction.message });
    }

    if (correction.suggestions.length > 0) {
      result.push({ text: ' → [ ', color: 'gray' });
      result.push({ text: correction.suggestions.join(', '), color: 'green' });
      result.push({ text: ' ]', color: 'gray' });
    }

    return result;
  }
}
