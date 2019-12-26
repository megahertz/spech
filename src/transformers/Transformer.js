'use strict';

/**
 * @abstract
 */
class Transformer {
  /**
   * @param {Document} document
   * @return {Document}
   * @package
   */
  modifyDocument(document) {
    return document;
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
