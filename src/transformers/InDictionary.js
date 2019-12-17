'use strict';

const Transformer = require('./Transformer');

class InDictionary extends Transformer {
  /**
   * @param {Dictionary} dictionary
   */
  constructor(dictionary) {
    super();
    this.dictionary = dictionary;
  }

  /**
   * @param {Correction} correction
   * @return {Correction}
   * @package
   */
  modifyCorrection(correction) {
    if (this.dictionary.includes(correction.fragment)) {
      return null;
    }

    return correction;
  }
}

module.exports = InDictionary;
