'use strict';

const path = require('path');
const CorrectionList = require('./CorrectionList');

const Format = {
  markdown: 'markdown',
};

const EXTENSION_TO_FORMAT = {
  md: Format.markdown,
};

class Document {
  constructor(name, text) {
    this.name = name;
    this.text = text;
    this.format = this.detectFormatByName(name);

    /**
     * @type {CorrectionList}
     */
    this.corrections = new CorrectionList();
  }

  hasErrors() {
    return this.corrections.length > 0;
  }

  detectFormatByName(name) {
    if (typeof name !== 'string') {
      return Format.markdown;
    }

    if (!name.match(/\.\w+$/)) {
      return Format.markdown;
    }

    const extension = path.extname(name).substr(1).toLowerCase();
    return EXTENSION_TO_FORMAT[extension] || Format.markdown;
  }
}

Document.Format = Format;

module.exports = Document;
