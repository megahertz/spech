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
   * @param {Document} document
   * @return {Document}
   * @package
   */
  modifyDocument(document) {
    const transformers = this.transformers;

    return transformers.reduce((doc, transformer) => {
      return transformer.modifyDocument(doc);
    }, document);
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
