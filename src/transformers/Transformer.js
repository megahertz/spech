'use strict';

/**
 * @abstract
 */
class Transformer {
  /**
   * @param {string} text
   * @return {string}
   * @package
   */
  modifyText(text) {
    return text;
  }

  /**
   * @param {Correction} correction
   * @return {Correction | void}
   * @package
   */
  modifyCorrection(correction) {
    return correction;
  }
}

module.exports = Transformer;
