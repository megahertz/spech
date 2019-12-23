'use strict';

const { correctionFactory } = require('./blocks/correction');
const { correctionListFactory } = require('./blocks/correctionList');

/**
 * @implements {Spech.Reporter}
 */
class Default {
  /**
   * @param {Spech.ReporterOptions} options
   */
  constructor(options) {
    const buildCorrection = correctionFactory({
      showProvider: options.showProvider,
      showRule: options.showRule,
    });

    this.builders = {
      correction: buildCorrection,
      correctionList: correctionListFactory({
        buildCorrection,
        providerOrder: options.providerOrder,
        showDuplicates: options.showDuplicates,
      }),
    };
  }

  /**
   * @param {Document[]} documents
   * @return {Spech.PrintItem}
   */
  print(documents) {
    return [
      this.printHeader(documents),
      documents.map(this.printDocument, this),
      this.printFooter(documents),
    ];
  }

  /**
   * @param {Document[]} documents
   * @return {Spech.PrintItem}
   * @protected
   */
  printHeader(documents) {

  }

  /**
   * @param {Document} document
   * @return {Spech.PrintItem}
   * @protected
   */
  printDocument(document) {
    if (!document.hasErrors()) {
      return [];
    }

    return [
      { text: document.name, newLine: true },
      this.builders.correctionList(document.corrections, document.text),
      { newLine: true },
    ];
  }

  /**
   * @param {Document[]} documents
   * @return {Spech.PrintItem}
   * @protected
   */
  printFooter(documents) {

  }
}

module.exports = Default;
