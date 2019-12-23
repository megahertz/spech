'use strict';

const { correctionTextsFactory } = require('./blocks/correctionTexts');
const Default = require('./Default.js');

class Texts extends Default {
  /**
   * @param {Spech.ReporterOptions} options
   */
  constructor(options) {
    super(options);

    this.builders.correctionList = correctionTextsFactory({
      buildCorrection: this.builders.correction,
      colors: options.colors,
      numberOfLines: options.numberOfLines,
      providerOrder: options.providerOrder,
      showDuplicates: options.showDuplicates,
    });
  }
}

module.exports = Texts;
