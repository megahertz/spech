'use strict';

const CorrectionList = require('./CorrectionList.js');

class Document {
  constructor(name, text) {
    this.name = name;
    this.text = text;

    /**
     * @type {CorrectionList}
     */
    this.corrections = new CorrectionList();
  }

  hasErrors() {
    return this.corrections.length > 0;
  }
}

module.exports = Document;
