'use strict';

const Transformer = require('./Transformer');

class Collection extends Transformer {
  constructor(transformers) {
    super();

    /**
     * @type {Transformer[]}
     */
    this.transformers = Array.isArray(transformers) ? transformers : [];
  }

  /**
   * @param {string} text
   * @return {string}
   * @package
   */
  modifyText(text) {
    const transformers = this.transformers;

    return transformers.reduce((changedText, transformer) => {
      return transformer.modifyText(changedText);
    }, text);
  }

  /**
   * @param {Correction} correction
   * @return {Correction | void}
   * @package
   */
  modifyCorrection(correction) {
    const transformers = this.transformers.slice().reverse();

    return transformers.reduce((changedCorrection, transformer) => {
      if (!changedCorrection) {
        return undefined;
      }

      return transformer.modifyCorrection(changedCorrection);
    }, correction);
  }

  /**
   * @param {Transformer} transformer
   * @package
   */
  addTransformer(transformer) {
    if (!(transformer instanceof Transformer)) {
      throw new Error('transformer should have type Transformer');
    }

    this.transformers.push(transformer);
  }
}

module.exports = Collection;
