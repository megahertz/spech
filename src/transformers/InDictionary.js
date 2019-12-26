'use strict';

const Transformer = require('./Transformer');

class InDictionary extends Transformer {
  /**
   * @param {Dictionary} dictionary
   */
  constructor(dictionary) {
    super();
    this.dictionary = dictionary;

    /**
     * @type {Document}
     */
    this.document = null;
  }

  /**
   * @param {Document} document
   * @return {Document}
   * @package
   */
  modifyDocument(document) {
    this.document = document;
    return document;
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

    const docDict = this.document && this.document.dictionary;
    if (docDict && docDict.includes(correction.fragment)) {
      return null;
    }

    return correction;
  }
}

module.exports = InDictionary;
