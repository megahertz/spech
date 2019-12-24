'use strict';

const Transformer = require('./Transformer');

class IgnoreCamelCase extends Transformer {
  /**
   * @param {Correction} correction
   * @return {Correction}
   * @package
   */
  modifyCorrection(correction) {
    const parts = correction.fragment.split(/(?=[A-Z])/);
    if (parts.length > 1) {
      return null;
    }

    return correction;
  }
}

module.exports = IgnoreCamelCase;
