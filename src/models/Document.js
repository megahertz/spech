'use strict';

const Content = require('./Content.js');
const Correction = require('./Correction.js');
const CorrectionList = require('./CorrectionList.js');

class Document {
  constructor(name, text) {
    this.name = name;
    this.content = new Content(text);

    /**
     * @type {CorrectionList}
     */
    this.corrections = new CorrectionList();
  }

  get text() {
    return this.content.toString();
  }

  hasErrors() {
    return this.corrections.length > 0;
  }

  /**
   * @param {Partial<Correction>} correctionData
   * @param {string} providerName
   */
  addCorrection(correctionData, providerName) {
    const lineInfo = this.content.getFragmentLines(
      correctionData.position,
      correctionData.length
    );

    if (!lineInfo) {
      return;
    }

    this.corrections.add(new Correction({
      ...correctionData,
      provider: providerName,
      startLine: lineInfo.startLine,
      endLine: lineInfo.endLine,
    }));
  }

  /**
   * @param {Dictionary} dictionary
   */
  removeDictionaryCorrections(dictionary) {
    this.corrections = this.corrections.filterByDictionary(dictionary);
  }
}

module.exports = Document;
