'use strict';

const Transformer = require('./Transformer');

class IgnoreCase extends Transformer {
  /**
   * @param {Correction} correction
   * @return {Correction}
   * @package
   */
  modifyCorrection(correction) {
    const text = correction.fragment.toLowerCase();
    if (correction.suggestions.some(s => s.toLowerCase() === text)) {
      return null;
    }

    return correction;
  }
}

module.exports = IgnoreCase;
